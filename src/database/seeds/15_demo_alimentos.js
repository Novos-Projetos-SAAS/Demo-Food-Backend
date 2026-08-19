import chalk from 'chalk';
import logSymbols from 'log-symbols';

/**
 * Prepara as categorias de alimentos e alimenta o cardápio DEMO.
 * O seed é idempotente e pode ser executado mesmo em um banco parcialmente inicializado.
 */
export async function seed(knex) {
    const categoriasNecessarias = [
        { nome: 'BÁSICOS', limite_escolhas: 2 },
        { nome: 'PROTEÍNAS', limite_escolhas: 1 },
        { nome: 'SALADAS', limite_escolhas: 1 },
        { nome: 'ACOMPANHAMENTOS', limite_escolhas: 3 },
        { nome: 'EXTRAS', limite_escolhas: 1 }
    ];

    const alimentos = [
        { categoria: 'BÁSICOS', nome: 'ARROZ BRANCO SOLTINHO', descricao: 'Arroz branco soltinho e temperado.' },
        { categoria: 'BÁSICOS', nome: 'FEIJAO COM CALABRESA', descricao: 'Feijão caseiro com calabresa.' },
        { categoria: 'PROTEÍNAS', nome: 'BIFE ACEBOLADO', descricao: 'Bife grelhado com cebola dourada.' },
        { categoria: 'PROTEÍNAS', nome: 'FRANGO AO MOLHO', descricao: 'Frango macio ao molho caseiro.' },
        { categoria: 'PROTEÍNAS', nome: 'CARNE DE PANELA COM BATATAS E CENOURA', descricao: 'Carne cozida lentamente com legumes.' },
        { categoria: 'PROTEÍNAS', nome: 'COXA E SOBRE COXA ASSADA', descricao: 'Frango assado e bem temperado.' },
        { categoria: 'SALADAS', nome: 'SALADA DE TOMATE E CEBOLA', descricao: 'Tomate e cebola frescos.' },
        { categoria: 'SALADAS', nome: 'BETERRABA RALADA', descricao: 'Beterraba fresca ralada.' },
        { categoria: 'ACOMPANHAMENTOS', nome: 'ABOBRINHA COM OVO', descricao: 'Abobrinha refogada com ovo.' },
        { categoria: 'ACOMPANHAMENTOS', nome: 'MANDIOCA COZIDA', descricao: 'Mandioca cozida e macia.' },
        { categoria: 'ACOMPANHAMENTOS', nome: 'POLENTA FRITA', descricao: 'Polenta dourada e crocante.' },
        { categoria: 'ACOMPANHAMENTOS', nome: 'MIX DE LEGUMES', descricao: 'Seleção colorida de legumes.' },
        { categoria: 'EXTRAS', nome: 'OVO FRITO', descricao: 'Ovo frito preparado na hora.' },
        { categoria: 'EXTRAS', nome: 'BACON CROCANTE', descricao: 'Bacon crocante para complementar.' },
        { categoria: 'EXTRAS', nome: 'MOLHO BARBECUE', descricao: 'Molho barbecue para acompanhar.' }
    ];

    await knex.transaction(async (trx) => {
        for (const categoria of categoriasNecessarias) {
            const existente = await trx('categorias_alimentos')
                .whereRaw('LOWER(nome) = LOWER(?)', [categoria.nome])
                .orderByRaw('deletado_em IS NULL DESC')
                .first();

            if (existente) {
                await trx('categorias_alimentos').where({ id: existente.id }).update({
                    nome: categoria.nome,
                    limite_escolhas: categoria.limite_escolhas,
                    ativo: true,
                    deletado_em: null,
                    atualizado_em: trx.fn.now()
                });
            } else {
                await trx('categorias_alimentos').insert({
                    nome: categoria.nome,
                    limite_escolhas: categoria.limite_escolhas,
                    ativo: true
                });
            }
        }

        const categorias = await trx('categorias_alimentos')
            .whereNull('deletado_em')
            .select(['id', 'nome']);

        const categoriasPorNome = new Map(
            categorias.map((categoria) => [categoria.nome.toUpperCase(), categoria.id])
        );

        for (const alimento of alimentos) {
            const categoriaId = categoriasPorNome.get(alimento.categoria.toUpperCase());

            if (!categoriaId) {
                throw new Error(`Categoria de alimento não encontrada: ${alimento.categoria}`);
            }

            const existente = await trx('alimentos')
                .whereRaw('LOWER(nome) = LOWER(?)', [alimento.nome])
                .first();

            if (existente) {
                await trx('alimentos').where({ id: existente.id }).update({
                    categoria_id: categoriaId,
                    nome: alimento.nome,
                    descricao: alimento.descricao,
                    disponivel_hoje: true,
                    deletado_em: null,
                    atualizado_em: trx.fn.now()
                });
            } else {
                await trx('alimentos').insert({
                    categoria_id: categoriaId,
                    nome: alimento.nome,
                    descricao: alimento.descricao,
                    disponivel_hoje: true
                });
            }
        }

        console.log(
            logSymbols.success,
            chalk.green(`${categoriasNecessarias.length} categorias e ${alimentos.length} alimentos DEMO verificados.`)
        );
    });
}
