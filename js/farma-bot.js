/**
 * FarmaBot - Sol (Farmacêutica Virtual da Farma Gente - Drogaria Itajaí)
 */
class FarmaChatbot {
  constructor() {
    this.isOpen = false;
    this.whatsappNumber = '5547999887766';
    this.avatarUrl = 'imgs/mascote/mascote-circle.png';
    this.init();
  }

  init() {
    this.renderWidget();
    this.bindEvents();
    
    // Auto show greeting bubble after 3 seconds
    setTimeout(() => {
      const bubble = document.getElementById('botWelcomeBubble');
      if (bubble && !this.isOpen) {
        bubble.style.display = 'flex';
      }
    }, 2800);
  }

  renderWidget() {
    if (document.getElementById('farmaBotContainer')) return;

    const div = document.createElement('div');
    div.id = 'farmaBotContainer';
    div.className = 'farma-bot-container';
    div.innerHTML = `
      <div id="botWelcomeBubble" class="bot-welcome-bubble" style="display:none;" onclick="window.farmaBot.toggleChat(true)">
        <span>👋</span>
        <div>
          <strong>Oi! Eu sou a Sol! 👋</strong>
          <div style="font-size:12px;color:#64748B;">Posso te ajudar a encontrar remédios ou enviar sua receita?</div>
        </div>
      </div>

      <div id="farmaBotFab" class="bot-fab" onclick="window.farmaBot.toggleChat()">
        <div class="bot-fab-inner">
          <img src="${this.avatarUrl}" alt="Sol - Farma Gente">
        </div>
        <div class="bot-online-badge"></div>
      </div>

      <div id="farmaChatModal" class="farma-chat-modal">
        <div class="chat-modal-header">
          <div class="chat-header-info">
            <div class="chat-avatar-wrap">
              <img src="${this.avatarUrl}" alt="Sol">
            </div>
            <div>
              <div class="chat-name">Sol</div>
              <div class="chat-status">
                <span class="status-dot"></span> Farmacêutica Virtual Farma Gente
              </div>
            </div>
          </div>
          <button class="chat-close-btn" onclick="window.farmaBot.toggleChat(false)">✕</button>
        </div>

        <div id="farmaChatMessages" class="chat-messages">
          <div class="chat-bubble bot">
            Olá! Bem-vindo(a) à <strong>Rede Farma Gente - Drogaria Itajaí</strong>! 💊<br><br>
            Como posso te ajudar hoje? Você pode buscar medicamentos, conferir ofertas ou enviar sua receita médica!
          </div>
        </div>

        <div class="chat-chips">
          <button class="chat-chip" onclick="window.farmaBot.handleChip('ofertas')">🏷️ Ofertas do Dia</button>
          <button class="chat-chip" onclick="window.farmaBot.handleChip('receita')">📋 Enviar Receita</button>
          <button class="chat-chip" onclick="window.farmaBot.handleChip('frete')">🚚 Frete & Entrega</button>
          <button class="chat-chip" onclick="window.farmaBot.handleChip('whatsapp')">💬 WhatsApp Oficial</button>
        </div>

        <form id="farmaChatForm" class="chat-input-bar">
          <input id="farmaChatInput" type="text" placeholder="Pergunte sobre remédios, sintomas..." autocomplete="off">
          <button type="submit" class="chat-send-btn">➔</button>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  bindEvents() {
    const form = document.getElementById('farmaChatForm');
    const input = document.getElementById('farmaChatInput');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          this.sendMessage(text);
          input.value = '';
        }
      });
    }
  }

  toggleChat(force) {
    this.isOpen = force !== undefined ? force : !this.isOpen;
    const modal = document.getElementById('farmaChatModal');
    const bubble = document.getElementById('botWelcomeBubble');
    if (modal) {
      modal.classList.toggle('open', this.isOpen);
      if (this.isOpen) {
        if (bubble) bubble.style.display = 'none';
        document.getElementById('farmaChatInput')?.focus();
      }
    }
  }

  sendMessage(text) {
    this.addMessage(text, 'user');
    setTimeout(() => {
      this.generateReply(text);
    }, 400);
  }

  addMessage(html, sender = 'bot') {
    const container = document.getElementById('farmaChatMessages');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = html;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  handleChip(type) {
    if (type === 'ofertas') {
      this.addMessage('Quais são as melhores ofertas de medicamentos hoje?', 'user');
      setTimeout(() => {
        const items = window.productStore ? window.productStore.getFeatured(3) : [];
        let html = 'Separei 3 super ofertas selecionadas na Farma Gente:<br><br>';
        items.forEach(p => {
          html += `
            <div style="background:#FFF;border:1px solid #E2E8F0;border-radius:10px;padding:8px;margin-bottom:8px;display:flex;gap:8px;align-items:center;">
              <img src="${p.image}" style="width:40px;height:40px;object-fit:contain;border-radius:6px;">
              <div style="flex:1;min-width:0;">
                <div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                <div style="font-size:12px;color:#DA1C82;font-weight:800;">${window.productStore.formatMoney(p.price)}</div>
              </div>
              <button onclick="window.cartEngine.addItem(window.productStore.getById('${p.id}'))" style="background:#DA1C82;color:#FFF;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:800;">+ Adicionar</button>
            </div>
          `;
        });
        this.addMessage(html, 'bot');
      }, 400);
    } else if (type === 'receita') {
      this.addMessage('Como faço para enviar minha receita médica?', 'user');
      setTimeout(() => {
        this.addMessage(
          '📋 <strong>Envio de Receita Médica Farma Gente:</strong><br><br>' +
          'Você pode enviar a foto da sua receita diretamente pelo nosso modal rápido ou direto no WhatsApp da nossa equipe farmacêutica:<br><br>' +
          '<button onclick="window.openPrescriptionModal()" style="display:inline-block;background:#009B9D;color:#FFF;padding:8px 16px;border-radius:20px;font-weight:700;font-size:12px;margin-bottom:8px;">Abrir Envio de Receita ➔</button><br>' +
          `<a href="https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent('Olá Sol! Gostaria de enviar uma receita médica para orçamento na Drogaria Itajaí.')}" target="_blank" style="display:inline-block;background:#25D366;color:#FFF;padding:8px 16px;border-radius:20px;font-weight:700;font-size:12px;">Enviar pelo WhatsApp 📱</a>`,
          'bot'
        );
      }, 400);
    } else if (type === 'frete') {
      this.addMessage('Qual é o prazo e valor do frete?', 'user');
      setTimeout(() => {
        this.addMessage(
          '🚚 <strong>Política de Entrega Farma Gente:</strong><br><br>' +
          '• <strong>Itajaí e Região:</strong> Entrega expressa em até 1 hora!<br>' +
          '• <strong>Retirada Grátis em Loja:</strong> Pronta em até 30 minutos.<br>' +
          '• <strong>Frete Grátis:</strong> Em todas as compras acima de R$ 149,00 para todo o Brasil.<br>' +
          '• Enviamos com rastreamento seguro pelos Correios e Melhor Envio.',
          'bot'
        );
      }, 400);
    } else if (type === 'whatsapp') {
      window.open(`https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento da Rede Farma Gente - Drogaria Itajaí.')}`, '_blank');
    }
  }

  generateReply(text) {
    const q = text.toLowerCase();

    if (q.includes('receita') || q.includes('crm') || q.includes('médico') || q.includes('prescrição')) {
      this.handleChip('receita');
      return;
    }

    if (q.includes('whatsapp') || q.includes('atendente') || q.includes('humano') || q.includes('telefone')) {
      this.addMessage(
        'Você pode falar agora com nosso farmacêutico de plantão pelo WhatsApp:<br><br>' +
        `<a href="https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(`Olá! Gostaria de tirar uma dúvida sobre: ${text}`)}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#FFF;padding:8px 16px;border-radius:20px;font-weight:700;font-size:13px;">` +
        '📱 Falar no WhatsApp: (47) 99988-7766</a>',
        'bot'
      );
      return;
    }

    // Search in catalog
    if (window.productStore) {
      const results = window.productStore.search(text);
      if (results.length > 0) {
        let html = `Encontrei <strong>${results.length} produto(s)</strong> no estoque com "${text}":<br><br>`;
        results.slice(0, 3).forEach(p => {
          html += `
            <div style="background:#FFF;border:1px solid #E2E8F0;border-radius:10px;padding:8px;margin-bottom:8px;display:flex;gap:8px;align-items:center;">
              <img src="${p.image}" style="width:42px;height:42px;object-fit:contain;border-radius:6px;">
              <div style="flex:1;min-width:0;">
                <div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                <div style="font-size:12px;color:#DA1C82;font-weight:800;">${window.productStore.formatMoney(p.price)}</div>
              </div>
              <button onclick="window.cartEngine.addItem(window.productStore.getById('${p.id}'))" style="background:#009B9D;color:#FFF;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:800;">+ Cesta</button>
            </div>
          `;
        });
        if (results.length > 3) {
          html += `<br><a href="loja.html?q=${encodeURIComponent(text)}" style="color:#009B9D;font-weight:700;font-size:12px;">Ver todos os ${results.length} resultados no catálogo ➔</a>`;
        }
        this.addMessage(html, 'bot');
        return;
      }
    }

    this.addMessage(
      `Compreendi sua mensagem sobre "${text}".<br><br>` +
      `Se precisar de orientação farmacêutica específica ou dosagens controladas, fale com nosso farmacêutico no WhatsApp:<br><br>` +
      `<a href="https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(`Olá Sol! Tenho uma dúvida sobre: ${text}`)}" target="_blank" style="display:inline-block;background:#009B9D;color:#FFF;padding:8px 14px;border-radius:20px;font-weight:800;font-size:12px;">Tirar dúvida no WhatsApp ➔</a>`,
      'bot'
    );
  }
}

window.farmaBot = new FarmaChatbot();
