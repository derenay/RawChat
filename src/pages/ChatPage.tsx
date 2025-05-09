// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/styles.css'; // Ana global stiller

interface Message {
  id: string;
  text: string;
  senderType: 'user' | 'assistant' | 'error' | 'welcome-message' | 'assistant-thinking';
}

interface AIModel {
    id: string; 
    name: string; 
    provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Alibaba' | 'Other'; 
}

// === GÜNCELLENMİŞ MODEL LİSTESİ ===
const SUPPORTED_MODELS: AIModel[] = [
    // OpenAI
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
    
    // Google (Gemini) - DİKKAT: BU ID'LER ÖRNEKTİR VE BAZILARI TAHMİNİDİR! RESMİ GOOGLE AI DOKÜMANTASYONUNDAN GÜNCEL VE DOĞRU ID'LERİ KONTROL EDİN!
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google" }, // Sizin cURL'den belirttiğiniz
    // { id: "gemini-2.0-pro", name: "Gemini 2.0 Pro (Tahmini)", provider: "Google" }, // Örnek
    // { id: "gemini-2.5-pro-latest", name: "Gemini 2.5 Pro (Tahmini)", provider: "Google" }, // Örnek
    { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro", provider: "Google" },
    { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash", provider: "Google" },
    { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", provider: "Google" }, // veya 'gemini-pro'
    
    // Anthropic (Claude) - DİKKAT: BU ID'LER ÖRNEKTİR! RESMİ ANTHROPIC DOKÜMANTASYONUNDAN GÜNCEL VE DOĞRU ID'LERİ KONTROL EDİN!
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "Anthropic" },
    { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", provider: "Anthropic" },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", provider: "Anthropic" },
    
    // Alibaba (Qwen) - DİKKAT: BU ID'LER ÖRNEKTİR! RESMİ ALIBABA CLOUD DOKÜMANTASYONUNDAN GÜNCEL VE DOĞRU ID'LERİ KONTROL EDİN!
    { id: "qwen-turbo", name: "Qwen Turbo", provider: "Alibaba" }, 
    { id: "qwen-plus", name: "Qwen Plus", provider: "Alibaba" },   
    { id: "qwen-max", name: "Qwen Max", provider: "Alibaba" }, 
];
// === MODEL LİSTESİ SONU ===


const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome_initial', 
      text: 'Merhaba! Lütfen yukarıdan bir AI modeli seçin, API anahtarınızı yönetmek için sağ üstteki anahtar ikonuna tıklayın ve sohbete başlayın.', 
      senderType: 'welcome-message' 
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [currentModelId, setCurrentModelId] = useState<string>(() => {
    const lastSelected = localStorage.getItem('lastSelectedModelId');
    return lastSelected && SUPPORTED_MODELS.find(m => m.id === lastSelected) 
           ? lastSelected 
           : SUPPORTED_MODELS[0]?.id || '';
  });
  
  const [currentApiKey, setCurrentApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [modalApiKeyInputValue, setModalApiKeyInputValue] = useState('');
  const [modalApiKeyStatus, setModalApiKeyStatus] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const chatOutputRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const chatHeaderModelSelectorRef = useRef<HTMLSelectElement>(null);

  const getModelById = useCallback((modelId: string | null): AIModel | undefined => {
    if (!modelId) return undefined;
    return SUPPORTED_MODELS.find(m => m.id === modelId);
  }, []);

  const getSelectedModelName = useCallback((modelId: string | null): string => {
    const model = getModelById(modelId);
    return model ? model.name : (modelId ? 'Bilinmeyen Model' : 'Model Seçilmedi');
  }, [getModelById]);

  useEffect(() => {
    if (currentModelId) {
      const loadedApiKey = localStorage.getItem(`apiKey_${currentModelId}`);
      setCurrentApiKey(loadedApiKey || '');
      if (isApiKeyModalOpen && modalApiKeyInputValue === '') {
          setModalApiKeyInputValue(loadedApiKey || '');
          setModalApiKeyStatus(loadedApiKey ? 'Kayıtlı anahtar yüklendi.' : 'Bu model için kayıtlı anahtar yok.');
      }
    } else {
      setCurrentApiKey('');
    }
    const modelDisplayElement = document.getElementById('current-model-display');
    if(modelDisplayElement) modelDisplayElement.textContent = getSelectedModelName(currentModelId);
  }, [currentModelId, getSelectedModelName, isApiKeyModalOpen, modalApiKeyInputValue]);

  useEffect(() => {
    if (chatOutputRef.current) {
        chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (promptInputRef.current) {
        promptInputRef.current.style.height = 'auto';
        let newHeight = promptInputRef.current.scrollHeight;
        if (newHeight > 150) newHeight = 150;
        promptInputRef.current.style.height = newHeight + 'px';
    }
  }, [prompt]);

  const handleModelChangeInChatHeader = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = event.target.value;
    setCurrentModelId(newModelId);
    localStorage.setItem('lastSelectedModelId', newModelId);
    if (isApiKeyModalOpen) {
        const loadedApiKey = localStorage.getItem(`apiKey_${newModelId}`);
        setModalApiKeyInputValue(loadedApiKey || '');
        setModalApiKeyStatus(loadedApiKey ? 'Kayıtlı anahtar yüklendi.' : 'Bu model için kayıtlı anahtar yok.');
    }
  };

  const prepareApiKeyModal = () => {
    if (currentModelId) {
        const loadedApiKey = localStorage.getItem(`apiKey_${currentModelId}`);
        setModalApiKeyInputValue(loadedApiKey || '');
        setModalApiKeyStatus(loadedApiKey ? 'Kayıtlı anahtar yüklendi.' : 'Bu model için kayıtlı anahtar yok.');
    } else {
        setModalApiKeyInputValue('');
        setModalApiKeyStatus('Lütfen önce sohbet başlığından bir model seçin.');
    }
  };

  const openApiKeyModal = () => {
    prepareApiKeyModal();
    setIsApiKeyModalOpen(true);
  };

  const closeApiKeyModal = () => {
    setIsApiKeyModalOpen(false);
    setModalApiKeyStatus('');
  };

  const handleModalApiKeySave = () => { 
    if (!currentModelId) {
        setModalApiKeyStatus('Lütfen önce sohbet başlığından bir model seçin.');
        return;
    }
    const newApiKeyToSave = modalApiKeyInputValue.trim();
    if (newApiKeyToSave === '') {
        localStorage.removeItem(`apiKey_${currentModelId}`);
        setCurrentApiKey('');
        setModalApiKeyInputValue('');
        setModalApiKeyStatus(`${getSelectedModelName(currentModelId)} için API anahtarı silindi.`);
    } else {
        localStorage.setItem(`apiKey_${currentModelId}`, newApiKeyToSave);
        setCurrentApiKey(newApiKeyToSave);
        setModalApiKeyStatus(`${getSelectedModelName(currentModelId)} için API anahtarı kaydedildi/güncellendi.`);
    }
  };
  
  const handleNewChat = () => {
    setMessages([{ 
      id: 'welcome_new', 
      text: 'Yeni bir sohbete hoş geldiniz! Lütfen mesajınızı yazın.', 
      senderType: 'welcome-message' 
    }]);
    if (promptInputRef.current) promptInputRef.current.focus();
    if (isSidebarOpen && window.innerWidth < 769) {
        setIsSidebarOpen(false);
    }
  };

  const addMessageToChat = (text: string, senderType: Message['senderType']) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, senderType }]);
  };
  
  // =====================================================================================
  // ===                          handleSendMessage BAŞLANGIÇ                          ===
  // =====================================================================================
  const handleSendMessage = async () => {
    if (!prompt.trim() || !currentModelId) {
        addMessageToChat('Lütfen mesaj göndermeden önce yukarıdan bir AI modeli seçin.', 'error');
        return;
    }
    if (!currentApiKey.trim()) {
        addMessageToChat(`Lütfen "${getSelectedModelName(currentModelId)}" için API anahtarınızı girin.`, 'error');
        openApiKeyModal();
        return;
    }
    
    const welcomeMsg = messages.find(m => m.id.startsWith('welcome_'));
    if (welcomeMsg) {
      setMessages(prev => prev.filter(m => !m.id.startsWith('welcome_')));
    }

    addMessageToChat(prompt, 'user');
    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);
    addMessageToChat("Yanıt alınıyor...", 'assistant-thinking');

    const selectedModelDetails = getModelById(currentModelId);
    let assistantResponseText = `"${selectedModelDetails?.name}" için API yanıtı alınamadı veya model desteklenmiyor.`;

    try {
        // ------ OpenAI API Çağrısı ------
        if (selectedModelDetails?.provider === "OpenAI") {
            const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
            const requestBody = {
                model: currentModelId,
                messages: [{ role: "user", content: currentPrompt }],
            };
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentApiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({error: {message: `OpenAI API: ${response.status} ${response.statusText}`}}));
                throw new Error(errorData.error?.message || `OpenAI API: HTTP ${response.status}`);
            }
            const data = await response.json();
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                assistantResponseText = data.choices[0].message.content.trim();
            } else {
                assistantResponseText = "OpenAI API'den geçerli bir yanıt formatı alınamadı.";
            }
        } 
        // ------ Google Gemini API Çağrısı (Sizin Verdiğiniz cURL'e Göre Uyarlandı) ------
        else if (selectedModelDetails?.provider === "Google") {
            const API_ENDPOINT_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/${currentModelId}:generateContent?key=${currentApiKey}`;
            const requestBodyGemini = {
                contents: [{ 
                    parts: [{ "text": currentPrompt }] 
                }],
                // generationConfig: { // İsteğe bağlı yapılandırma
                //   temperature: 0.7,
                //   topK: 1,
                //   topP: 1,
                //   maxOutputTokens: 2048,
                // },
                // safetySettings: [ // İsteğe bağlı güvenlik ayarları
                //   { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                //   // ... diğer kategoriler
                // ]
            };
            const response = await fetch(API_ENDPOINT_GEMINI, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBodyGemini)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({error: {message: `Google Gemini API: ${response.status} ${response.statusText}`}}));
                // Gemini hata mesajları genellikle errorData.error.message içinde gelir
                throw new Error(errorData.error?.message || `Google Gemini API: HTTP ${response.status}`);
            }
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts && 
                data.candidates[0].content.parts.length > 0 && data.candidates[0].content.parts[0].text) {
                assistantResponseText = data.candidates[0].content.parts[0].text.trim();
            } else {
                 assistantResponseText = "Google Gemini API'den geçerli bir yanıt formatı alınamadı.";
                 console.warn("Beklenmeyen Gemini Yanıtı:", data); 
            }
        }
        // ------ Anthropic Claude API Çağrısı ------
        else if (selectedModelDetails?.provider === "Anthropic") {
            const API_ENDPOINT_ANTHROPIC = 'https://api.anthropic.com/v1/messages';
            const requestBodyAnthropic = {
                model: currentModelId, // Claude model ID'si (örn: "claude-3-opus-20240229")
                max_tokens: 1024, 
                messages: [{ role: "user", content: currentPrompt }]
            };
            const response = await fetch(API_ENDPOINT_ANTHROPIC, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': currentApiKey, // Anthropic API anahtarı header'ı
                    'anthropic-version': '2023-06-01' // Gerekli Anthropic API versiyonu
                },
                body: JSON.stringify(requestBodyAnthropic)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({error: {type: 'unknown_error', message: `Anthropic API: ${response.status} ${response.statusText}`}}));
                throw new Error(errorData.error?.message || `Anthropic API: HTTP ${response.status}`);
            }
            const data = await response.json();
            if (data.content && data.content.length > 0 && data.content[0].type === "text") {
                assistantResponseText = data.content[0].text.trim();
            } else {
                assistantResponseText = "Anthropic Claude API'den geçerli bir yanıt formatı alınamadı.";
            }
        }
        // ------ Alibaba Qwen API Çağrısı ------
        else if (selectedModelDetails?.provider === "Alibaba") {
            // DİKKAT: Bu çok genel bir örnektir. Alibaba DashScope Qwen API'sinin
            // endpoint'i, yetkilendirme yöntemi ve istek/yanıt yapısı için
            // RESMİ DOKÜMANTASYONU KONTROL EDİN!
            const API_ENDPOINT_QWEN = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'; // Örnek
            const requestBodyQwen = {
                model: currentModelId, // Qwen API'sinin beklediği model ID (örn: qwen-turbo, qwen-plus)
                input: {
                    prompt: currentPrompt
                },
                parameters: { /* text_type: "markdown" gibi parametreler gerekebilir */ }
            };
            const response = await fetch(API_ENDPOINT_QWEN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentApiKey}` // DashScope genellikle Bearer token kullanır
                    // 'X-DashScope-SSE': 'enable' // Eğer stream kullanıyorsanız
                },
                body: JSON.stringify(requestBodyQwen)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: `Alibaba Qwen API: ${response.status} ${response.statusText}`}));
                throw new Error(errorData.message || errorData.Message || errorData.code || `Alibaba Qwen API: HTTP ${response.status}`);
            }
            const data = await response.json();
            if (data.output && data.output.text) { // Yanıt yapısı değişebilir!
                assistantResponseText = data.output.text.trim();
            } else if (data.output && data.output.choices && data.output.choices.length > 0 && data.output.choices[0].message) {
                assistantResponseText = data.output.choices[0].message.content.trim();
            } else {
                assistantResponseText = "Alibaba Qwen API'den geçerli bir yanıt formatı alınamadı.";
            }
        }
        else {
            assistantResponseText = `"${selectedModelDetails?.name}" için API çağrı mantığı henüz tanımlanmamış.`;
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setMessages(prev => prev.filter(m => m.senderType !== 'assistant-thinking'));
        addMessageToChat(assistantResponseText, 'assistant');

    } catch (error: any) {
        setMessages(prev => prev.filter(m => m.senderType !== 'assistant-thinking'));
        console.error('API isteği başarısız:', selectedModelDetails?.provider, error);
        addMessageToChat(`Hata (${selectedModelDetails?.provider || 'Bilinmeyen'}): ${error.message}`, 'error');
    } finally {
        setIsLoading(false);
    }
  };
  // =====================================================================================
  // ===                           handleSendMessage BİTİŞ                             ===
  // =====================================================================================

  // JSX (Arayüz) kısmı aynı kalır (sidebar, chat-container, modal vb.)
  return (
    <div className="app-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
            <div className="sidebar-header">
                <button className="menu-button" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Menüyü Kapat">
                    <span className="material-symbols-outlined">menu_open</span> 
                </button>
                <span className="app-logo">AI Sohbet</span>
            </div>
            <nav className="sidebar-nav">
                <button className="new-chat-button" id="new-chat-button" onClick={handleNewChat}>
                    <span className="material-symbols-outlined">add_comment</span>
                    Yeni Sohbet
                </button>
            </nav>
            <div className="sidebar-footer">
                <p id="current-model-display" style={{display: 'none'}}>
                    {/* Bu gizlenebilir veya kaldırılabilir */}
                </p>
                <a href="#" className="settings-link" id="settings-placeholder-link" onClick={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined">settings</span>
                    Ayarlar (Yer Tutucu)
                </a>
            </div>
        </aside>

        <main className="chat-container">
            <header className="chat-header">
                <button className="menu-button-mobile" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Menüyü Aç/Kapat">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="chat-header-model-selector-container">
                    <select 
                        id="chat-header-model-selector" 
                        ref={chatHeaderModelSelectorRef}
                        value={currentModelId} 
                        onChange={handleModelChangeInChatHeader}
                        aria-label="Sohbet için AI Modeli Seçin"
                    >
                        {SUPPORTED_MODELS.map(model => (
                            <option key={model.id} value={model.id}>{model.name} ({model.provider})</option>
                        ))}
                    </select>
                </div>
                <button id="api-key-modal-trigger-button" onClick={openApiKeyModal} className="header-action-button" aria-label="API Anahtarlarını Yönet">
                    <span className="material-symbols-outlined">vpn_key</span>
                </button>
            </header>

            <div className="chat-messages" id="chat-output" ref={chatOutputRef}>
                {messages.map(msg => (
                    <div key={msg.id} className={`message-container ${msg.senderType}`}>
                        <div className="message-bubble"><p>{msg.text}</p></div>
                    </div>
                ))}
            </div>

            <footer className="chat-input-area">
                <div className="input-wrapper">
                    <textarea 
                        id="prompt-input" 
                        ref={promptInputRef}
                        placeholder="Mesajınızı buraya yazın..." 
                        rows={1}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        aria-label="Sohbet mesajı giriş alanı"
                    />
                    <button id="send-button" aria-label="Gönder" onClick={handleSendMessage} disabled={isLoading}>
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
                <p className="disclaimer">AI modelleri hata yapabilir. Önemli bilgileri doğrulamayı unutmayın.</p>
            </footer>
        </main>

        {isApiKeyModalOpen && (
            <div className="modal-overlay open" onClick={closeApiKeyModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>API Anahtarı Yönetimi</h2>
                        <button id="close-modal-button" onClick={closeApiKeyModal} className="close-button" aria-label="Kapat">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>Lütfen <strong id="modal-selected-model-name">{getSelectedModelName(currentModelId)} ({getModelById(currentModelId)?.provider})</strong> için API anahtarınızı girin:</p>
                        <div className="api-key-input-modal-group">
                            <label htmlFor="modal-api-key-input" className="sr-only">API Anahtarı</label>
                            <input 
                                type="password" 
                                id="modal-api-key-input" 
                                placeholder="API Anahtarınız"
                                value={modalApiKeyInputValue}
                                onChange={(e) => setModalApiKeyInputValue(e.target.value)}
                                aria-label={`${getSelectedModelName(currentModelId)} için API Anahtarı`}
                            />
                            <button id="modal-save-key-button" onClick={handleModalApiKeySave}>Anahtarı Kaydet</button>
                        </div>
                        <p id="modal-api-key-status">{modalApiKeyStatus}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ChatPage;