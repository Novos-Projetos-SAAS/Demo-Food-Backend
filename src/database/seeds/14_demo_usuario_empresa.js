import chalk from 'chalk';
import logSymbols from 'log-symbols';

import { hashPassword } from '../../utils/passwordUtils.js';

/**
 * Prepara o acesso e os dados institucionais da versão DEMO.
 * Este seed é idempotente e pode ser executado novamente sem duplicar dados.
 */
export async function seed(knex) {
    const DEMO = {
        nome: 'Administrador Demo',
        email: 'demo@demo.com',
        senha: process.env.SEED_DEMO_PASSWORD || 'Senhaforte123@',
        nivel_acesso_id: 1
    };

    await knex.transaction(async (trx) => {
        const senhaHash = await hashPassword(DEMO.senha);
        const usuarioExistente = await trx('usuarios')
            .whereRaw('LOWER(email) = ?', [DEMO.email.toLowerCase()])
            .first();

        let usuarioId;

        if (usuarioExistente) {
            const [usuarioAtualizado] = await trx('usuarios')
                .where({ id: usuarioExistente.id })
                .update({
                    nome: DEMO.nome,
                    email: DEMO.email,
                    senha_hash: senhaHash,
                    nivel_acesso_id: DEMO.nivel_acesso_id,
                    ativo: true,
                    deletado_em: null,
                    atualizado_em: trx.fn.now()
                })
                .returning(['id']);

            usuarioId = usuarioAtualizado.id;
        } else {
            const [novoUsuario] = await trx('usuarios')
                .insert({
                    nome: DEMO.nome,
                    email: DEMO.email,
                    senha_hash: senhaHash,
                    nivel_acesso_id: DEMO.nivel_acesso_id,
                    ativo: true
                })
                .returning(['id']);

            usuarioId = novoUsuario.id;
        }

        const permissoes = await trx('permissoes').select('id');

        if (permissoes.length > 0) {
            await trx('permissoes_usuarios')
                .insert(permissoes.map((permissao) => ({
                    usuario_id: usuarioId,
                    permissao_id: permissao.id
                })))
                .onConflict(['usuario_id', 'permissao_id'])
                .ignore();
        }

        const dadosEmpresa = {
            id: 1,
            nome_proprietario: 'Responsável Demonstração',
            cpf_proprietario: null,
            telefone_proprietario: '(11) 99999-0000',
            razao_social: 'EMPRESA DEMONSTRAÇÃO LTDA',
            nome_fantasia: 'Demo Food',
            cnpj: null,
            telefone_empresa: '(11) 99999-0000',
            email_empresa: 'contato@demo.com',
            logo_url: null,
            cep: '01001-000',
            logradouro: 'Avenida Central',
            numero: '100',
            complemento: 'Loja Demo',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            imprimir_automaticamente: false,
            nome_impressora: null,
            atualizado_em: trx.fn.now()
        };

        const empresaExistente = await trx('dados_empresa').where({ id: 1 }).first();

        if (empresaExistente) {
            await trx('dados_empresa').where({ id: 1 }).update(dadosEmpresa);
        } else {
            const { atualizado_em, ...dadosInsercao } = dadosEmpresa;
            await trx('dados_empresa').insert(dadosInsercao);
        }

        console.log(logSymbols.success, chalk.green(`Ambiente DEMO configurado. Login: ${DEMO.email}`));
    });
}
