import chalk from 'chalk';
import logSymbols from 'log-symbols';

/** Cria um catálogo de categorias de produtos mais completo para demonstração. */
export async function seed(knex) {
    const categorias = [
        { nome: 'Bebidas', descricao: 'Bebidas geladas para acompanhar a refeição.', ativo: true, ordem_exibicao: 1 },
        { nome: 'Sobremesas', descricao: 'Doces e sobremesas individuais.', ativo: true, ordem_exibicao: 2 },
        { nome: 'Adicionais', descricao: 'Complementos vendidos separadamente.', ativo: true, ordem_exibicao: 3 }
    ];

    await knex.transaction(async (trx) => {
        for (const categoria of categorias) {
            const existente = await trx('categorias_produtos').whereRaw('LOWER(nome) = LOWER(?)', [categoria.nome]).first();

            if (existente) {
                await trx('categorias_produtos').where({ id: existente.id }).update({
                    ...categoria,
                    deletado_em: null,
                    atualizado_em: trx.fn.now()
                });
            } else {
                await trx('categorias_produtos').insert(categoria);
            }
        }

        console.log(logSymbols.success, chalk.green('Categorias de produtos DEMO verificadas.'));
    });
}
