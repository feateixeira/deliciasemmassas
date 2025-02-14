document.getElementById('pedidoForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Coletar o nome do usuário
    const nome = document.getElementById('nome').value.trim();
    if (!nome) {
        Swal.fire({
            title: 'Atenção!',
            text: 'Por favor, insira seu nome.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Coletar as escolhas do usuário
    const massa = document.querySelector('input[name="massa"]:checked');
    const molhos = Array.from(document.querySelectorAll('input[name="molho"]:checked')).map(m => m.value);
    const temperos = Array.from(document.querySelectorAll('input[name="tempero"]:checked')).map(t => t.value);
    const carne = document.querySelector('input[name="carne"]:checked');

    // Coletar ingredientes e suas quantidades
    const ingredientes = [];
    document.querySelectorAll('.ingrediente').forEach(ing => {
        const nome = ing.querySelector('.nome-ingrediente').textContent;
        const quantidade = parseInt(ing.querySelector('.quantidade').textContent);
        if (quantidade > 0) {
            ingredientes.push({ nome, quantidade });
        }
    });

    // Verificar se o usuário escolheu mais de 2 molhos
    if (molhos.length > 2) {
        Swal.fire({
            title: 'Atenção!',
            text: 'Você pode escolher no máximo 2 molhos.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Calcular o custo dos ingredientes extras
    let custoIngredientesExtras = 0;
    ingredientes.forEach(i => {
        if (i.quantidade > 1) {
            custoIngredientesExtras += (i.quantidade - 1) * 2; // R$ 2,00 por unidade adicional
        }
    });

    // Formatar o pedido
    const pedidoFormatado = `
        *Pedido de Macarrão:*
        - Nome: ${nome}
        - Massa: ${massa ? massa.value : 'Nenhuma escolhida'}
        - Molhos: ${molhos.length > 0 ? molhos.join(', ') : 'Nenhum escolhido'}
        - Ingredientes: ${ingredientes.length > 0 ? ingredientes.map(i => `${i.nome} (${i.quantidade}x)`).join(', ') : 'Nenhum escolhido'}
        - Temperos: ${temperos.length > 0 ? temperos.join(', ') : 'Nenhum escolhido'}
        - Carne: ${carne ? carne.value : 'Nenhuma escolhida'}
        - Custo Ingredientes Extras: R$ ${custoIngredientesExtras.toFixed(2)}
    `;

    // Adicionar o pedido à lista de pedidos
    adicionarPedido(pedidoFormatado, custoIngredientesExtras);

    // Limpar o formulário para o próximo pedido
    document.getElementById('pedidoForm').reset();
});

// Lista de pedidos
let pedidos = [];
const valorMacarrao = 25; // Valor de cada macarrão
let valorTotal = 0;

// Função para adicionar um pedido à lista
function adicionarPedido(pedido, custoIngredientesExtras) {
    pedidos.push(pedido); // Adiciona o pedido ao array
    valorTotal += valorMacarrao + custoIngredientesExtras; // Adiciona R$ 25,00 + custo dos extras

    // Atualiza o valor total na tela
    document.getElementById('total').textContent = valorTotal.toFixed(2);

    const listaPedidos = document.getElementById('listaPedidos');

    // Cria um novo item na lista
    const itemLista = document.createElement('li');
    itemLista.textContent = pedido;
    listaPedidos.appendChild(itemLista);
}

// Função para enviar todos os pedidos via WhatsApp
function enviarPedidosWhatsApp(entrega, endereco) {
    if (pedidos.length === 0) {
        Swal.fire({
            title: 'Ops!',
            text: 'Nenhum pedido foi adicionado.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Coletar o nome do usuário
    const nome = document.getElementById('nome').value.trim();

    // Calcular o valor total com ou sem entrega
    let valorFinal = valorTotal;
    if (entrega) {
        valorFinal += 5; // Adiciona R$ 5,00 para entrega
    }

    // Formatar todos os pedidos em uma única mensagem
    const todosPedidosFormatados = `
        *Pedidos Realizados:*
        ${pedidos.join('\n\n')}

        *Nome:* ${nome}
        *Valor Total:* R$ ${valorFinal.toFixed(2)}
        ${entrega ? '(Inclui taxa de entrega de R$ 5,00)' : ''}
        ${entrega ? `\n*Endereço de Entrega:* ${endereco}` : '\n*Retirada na Loja:* Quadra 34 conjunto f casa 6 - Vila São José, Brazlândia - DF'}
        \n*Tempo de Preparo:* 30 a 40 minutos
    `;

    // Codificar a mensagem para ser usada em uma URL
    const pedidosCodificados = encodeURIComponent(todosPedidosFormatados);

    // Número de telefone para enviar os pedidos (substitua pelo número desejado)
    const numeroTelefone = '61996575524'; // Exemplo: +55 (11) 99999-9999

    // Criar o link do WhatsApp
    const linkWhatsApp = `https://wa.me/${numeroTelefone}?text=${pedidosCodificados}`;

    // Abrir o link do WhatsApp
    abrirLinkWhatsApp(linkWhatsApp);
}

// Função para abrir o link do WhatsApp
function abrirLinkWhatsApp(link) {
    // Cria um link temporário e simula um clique
    const linkTemp = document.createElement('a');
    linkTemp.href = link;
    linkTemp.target = '_blank'; // Abre em uma nova aba
    linkTemp.rel = 'noopener noreferrer'; // Boas práticas de segurança
    document.body.appendChild(linkTemp);
    linkTemp.click();
    document.body.removeChild(linkTemp);
}

// Botão "Buscar"
document.getElementById('btnBuscar').addEventListener('click', function() {
    // Envia os pedidos com o endereço da loja
    enviarPedidosWhatsApp(false, null);
});

// Botão "Entrega"
document.getElementById('btnEntrega').addEventListener('click', function() {
    // Exibe um modal para o usuário inserir o endereço
    Swal.fire({
        title: 'Endereço de Entrega',
        html: `
            <p>Será adicionado R$ 5,00 ao valor total para entrega.</p>
            <input type="text" id="enderecoEntrega" placeholder="Digite seu endereço completo" class="swal2-input">
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Enviar Pedido',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e67e22',
        preConfirm: () => {
            const endereco = document.getElementById('enderecoEntrega').value.trim();
            if (!endereco) {
                Swal.showValidationMessage('Por favor, insira o endereço de entrega.');
            }
            return endereco;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const endereco = result.value;
            enviarPedidosWhatsApp(true, endereco); // Envia com taxa de entrega
        }
    });
});

// Função para aumentar/diminuir a quantidade de ingredientes
document.querySelectorAll('.btn-mais').forEach(btn => {
    btn.addEventListener('click', function() {
        const ingrediente = this.getAttribute('data-ingrediente');
        const quantidadeElement = document.querySelector(`.quantidade[data-ingrediente="${ingrediente}"]`);
        let quantidade = parseInt(quantidadeElement.textContent);
        quantidade++;
        quantidadeElement.textContent = quantidade;
    });
});

document.querySelectorAll('.btn-menos').forEach(btn => {
    btn.addEventListener('click', function() {
        const ingrediente = this.getAttribute('data-ingrediente');
        const quantidadeElement = document.querySelector(`.quantidade[data-ingrediente="${ingrediente}"]`);
        let quantidade = parseInt(quantidadeElement.textContent);
        if (quantidade > 0) { // Garante que a quantidade não seja negativa
            quantidade--;
            quantidadeElement.textContent = quantidade;
        }
    });
});