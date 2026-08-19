import chalk from 'chalk';
import logSymbols from 'log-symbols';

/** Insere produtos fictícios para que a etapa de complementos já esteja pronta. */
export async function seed(knex) {
    const produtos = [
        { categoria: 'Bebidas', nome: 'Coca-Cola 350ml', descricao: 'Refrigerante em lata, servido gelado.', preco: 6.00, ordem_exibicao: 1 },
        { categoria: 'Bebidas', nome: 'Guaraná 350ml', descricao: 'Refrigerante de guaraná em lata.', preco: 5.50, ordem_exibicao: 2 },
        { categoria: 'Bebidas', nome: 'Água Mineral 500ml', descricao: 'Água mineral sem gás.', preco: 3.50, ordem_exibicao: 3 },
        { categoria: 'Bebidas', nome: 'Suco de Laranja 300ml', descricao: 'Suco de laranja pronto para beber.', preco: 7.00, ordem_exibicao: 4 },
        { categoria: 'Sobremesas', nome: 'Pudim de Leite', descricao: 'Pudim cremoso com calda de caramelo.', preco: 8.00, ordem_exibicao: 1 },
        { categoria: 'Sobremesas', nome: 'Mousse de Chocolate', descricao: 'Mousse de chocolate em porção individual.', preco: 7.50, ordem_exibicao: 2 },
        { categoria: 'Adicionais', nome: 'Farofa Extra', descricao: 'Porção adicional de farofa temperada.', preco: 4.00, ordem_exibicao: 1 },
        { categoria: 'Adicionais', nome: 'Molho Especial', descricao: 'Molho cremoso da casa em porção individual.', preco: 3.00, ordem_exibicao: 2 }
    ];

    await knex.transaction(async (trx) => {
        const categorias = await trx('categorias_produtos').whereNull('deletado_em').select(['id', 'nome']);
        const categoriasPorNome = new Map(categorias.map((categoria) => [categoria.nome.toLowerCase(), categoria.id]));

        for (const produto of produtos) {
            const categoriaId = categoriasPorNome.get(produto.categoria.toLowerCase());
            if (!categoriaId) throw new Error(`Categoria de produto não encontrada: ${produto.categoria}`);

            const existente = await trx('produtos')
                .where({ categoria_produto_id: categoriaId })
                .whereRaw('LOWER(nome) = LOWER(?)', [produto.nome])
                .first();

            const payload = {
                categoria_produto_id: categoriaId,
                nome: produto.nome,
                descricao: produto.descricao,
                preco: produto.preco,
                ativo: true,
                disponivel_hoje: true,
                ordem_exibicao: produto.ordem_exibicao,
                deletado_em: null
            };

            if (existente) {
                await trx('produtos').where({ id: existente.id }).update({ ...payload, atualizado_em: trx.fn.now() });
            } else {
                await trx('produtos').insert(payload);
            }
        }

        console.log(logSymbols.success, chalk.green(`${produtos.length} produtos DEMO verificados.`));
    });
}
