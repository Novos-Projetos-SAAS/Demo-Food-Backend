import chalk from 'chalk';
import logSymbols from 'log-symbols';

import connection from './connection.js';

const SEEDS_DEMO = [
    '14_demo_usuario_empresa.js',
    '15_demo_alimentos.js',
    '16_demo_categorias_produtos.js',
    '17_demo_produtos.js'
];

/**
 * Deixa o repositório DEMO pronto para subir em um banco PostgreSQL vazio.
 * Para desativar esse comportamento, use AUTO_SETUP_DEMO=false.
 */
export async function prepararBancoDemo() {
    if (String(process.env.AUTO_SETUP_DEMO || 'true').toLowerCase() === 'false') {
        console.log(logSymbols.info, chalk.cyan('AUTO_SETUP_DEMO desativado.'));
        return;
    }

    console.log(logSymbols.info, chalk.cyan('Verificando migrations e dados DEMO...'));
    await connection.migrate.latest();

    const nivelBase = await connection('niveis_acesso').first('id');

    if (!nivelBase) {
        await connection.seed.run();
        console.log(logSymbols.success, chalk.green('Banco DEMO inicializado com todos os seeds.'));
        return;
    }

    const [usuarioDemo, empresaDemo, alimentoDemo, produtoDemo] = await Promise.all([
        connection('usuarios').whereRaw('LOWER(email) = ?', ['demo@demo.com']).first('id'),
        connection('dados_empresa').where({ id: 1 }).first('id'),
        connection('alimentos').whereNull('deletado_em').first('id'),
        connection('produtos').whereNull('deletado_em').first('id')
    ]);

    if (usuarioDemo && empresaDemo && alimentoDemo && produtoDemo) {
        console.log(logSymbols.success, chalk.green('Dados DEMO já estão configurados.'));
        return;
    }

    for (const specific of SEEDS_DEMO) {
        await connection.seed.run({ specific });
    }

    console.log(logSymbols.success, chalk.green('Dados adicionais da DEMO configurados.'));
}
