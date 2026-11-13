
export async function up(knex) {
    await knex.schema.alterTable('pedidos', (table) => {
        table.uuid('chave_idempotencia').nullable();

        table.string('hash_requisicao', 64).nullable();

        table.unique(
            'chave_idempotencia',
            'pedidos_chave_idempotencia_unica'
        );
    });
}

export async function down(knex) {
    await knex.schema.alterTable('pedidos', (table) => {
        table.dropUnique(
            'chave_idempotencia',
            'pedidos_chave_idempotencia_unica'
        );

        table.dropColumn('hash_requisicao');
        table.dropColumn('chave_idempotencia');
    });
}
