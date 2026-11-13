
import { createHash } from 'node:crypto';

// Organiza as propriedades para gerar um hash consistente.
function ordenarValor(valor) {
    if (Array.isArray(valor)) {
        return valor.map(ordenarValor);
    }

    if (valor && typeof valor === 'object') {
        return Object.fromEntries(
            Object.entries(valor)
                .filter(([, item]) => item !== undefined)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([chave, item]) => [
                    chave,
                    ordenarValor(item)
                ])
        );
    }

    return valor;
}

// Calcula uma assinatura SHA-256 do conteúdo do pedido.
export function calcularHashPedido(body) {
    const semChave = { ...body };
    delete semChave.idempotency_key;

    return createHash('sha256')
        .update(JSON.stringify(ordenarValor(semChave)))
        .digest('hex');
}

// Verifica se a chave é um UUID versão 4 válido.
export function chavePedidoValida(chave) {
    return typeof chave === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chave);
}

// Procura uma tentativa que já tenha sido registrada.
export async function buscarPedidoPorChave(db, chave) {
    return db('pedidos')
        .select('id', 'valor_total', 'hash_requisicao')
        .where({ chave_idempotencia: chave })
        .first();
}

// Retorna o pedido existente sem criar outro.
export function responderPedidoExistente(res, pedido, hash) {
    if (pedido.hash_requisicao !== hash) {
        return res.status(409).json({
            status: 'fail',
            code: 'CHAVE_IDEMPOTENCIA_REUTILIZADA',
            message: 'Os dados do pedido mudaram. Confira o carrinho antes de confirmar novamente.'
        });
    }

    return res.status(200).json({
        status: 'success',
        reutilizado: true,
        data: {
            pedido_id: pedido.id,
            total: Number(pedido.valor_total)
        }
    });
}
