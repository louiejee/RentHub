// flowise-chat.js
document.addEventListener('DOMContentLoaded', function() {
    // Flowise Chatbot Integration
    class FlowiseChatbot {
        constructor(config) {
            this.chatflowid = config.chatflowid;
            this.apiHost = config.apiHost;
            this.theme = config.theme || {};
            this.chatbotConfig = config.chatbotConfig || {};
            this.init();
        }

        init() {
            // Create chatbot container
            this.createChatbotContainer();
            // Load Flowise embed script
            this.loadFlowiseScript();
        }

        createChatbotContainer() {
            // Check if container already exists
            if (document.getElementById('flowise-chatbot-container')) return;

            // Create container for Flowise
            const container = document.createElement('div');
            container.id = 'flowise-chatbot-container';
            document.body.appendChild(container);
        }

        loadFlowiseScript() {
            // Check if script already loaded
            if (window.FlowiseChatbotLoaded) return;

            // Create script element
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
                Chatbot.init({
                    chatflowid: "${this.chatflowid}",
                    apiHost: "${this.apiHost}",
                    theme: ${JSON.stringify(this.theme)},
                    chatbotConfig: ${JSON.stringify(this.chatbotConfig)}
                })
            `;
            document.head.appendChild(script);
            
            window.FlowiseChatbotLoaded = true;
        }
    }

    // Initialize chatbot with your specific configuration
    const chatbot = new FlowiseChatbot({
        chatflowid: "1468289b-0fc4-417d-af50-e548ec94717d",
        apiHost: "https://cloud.flowiseai.com",
        theme: {
            button: {
                backgroundColor: "#4CAF50", // Match your site's primary color
                right: 20,
                bottom: 20,
                size: "medium",
                iconColor: "white",
                customIconSrc: "https://cdn-icons-png.flaticon.com/512/1036/1036745.png"
            },
            chatWindow: {
                welcomeMessage: "Hello! I'm your RentHub assistant. How can I help you today?",
                backgroundColor: "#ffffff",
                height: 500,
                width: 400,
                fontSize: 14,
                botMessage: {
                    backgroundColor: "#f0f0f0",
                    textColor: "#333333",
                    showAvatar: true,
                    avatarSrc: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                },
                userMessage: {
                    backgroundColor: "#4CAF50",
                    textColor: "#ffffff",
                    showAvatar: true,
                    avatarSrc: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                },
                textInput: {
                    placeholder: "Type your message here...",
                    backgroundColor: "#ffffff",
                    textColor: "#333333",
                    sendButtonColor: "#4CAF50"
                }
            }
        },
        chatbotConfig: {
            // Optional: Add any custom configuration
        }
    });
});