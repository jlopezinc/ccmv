/**
 * Integração com o Google Drive API v3
 * 
 * Este script busca ficheiros de uma pasta pública do Google Drive
 * e exibe-os dinamicamente na secção "Ficheiros e Documentos"
 */

(async function() {
    'use strict';

    // Validar configuração
    if (!DRIVE_CONFIG || !DRIVE_CONFIG.folderId || !DRIVE_CONFIG.apiKey) {
        console.error('Configuração do Google Drive não encontrada. Verifique o ficheiro config.js');
        return;
    }

    if (DRIVE_CONFIG.folderId === 'YOUR_FOLDER_ID_HERE' || DRIVE_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('Google Drive API não configurado. Por favor, configure o ficheiro js/config.js');
        showMessage('⚙️ Para ver os ficheiros, é necessário configurar a integração com o Google Drive. Consulte GOOGLE_DRIVE_SETUP.md para instruções.', 'info');
        return;
    }

    const API_BASE_URL = 'https://www.googleapis.com/drive/v3';
    const DRIVE_FILE_BASE_URL = 'https://drive.google.com/file/d/';
    
    /**
     * Obtém o ícone apropriado para o tipo de ficheiro
     */
    function getFileIcon(mimeType, iconLink) {
        // Se o Google Drive fornecer um ícone, podemos usá-lo
        // Caso contrário, usar emojis padrão
        const iconMap = {
            'application/vnd.google-apps.folder': '📁',
            'application/vnd.google-apps.document': '📄',
            'application/vnd.google-apps.spreadsheet': '📊',
            'application/vnd.google-apps.presentation': '📽️',
            'application/pdf': '📄',
            'application/msword': '📄',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄',
            'application/vnd.ms-excel': '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
            'image/': '🖼️',
            'video/': '🎥',
            'audio/': '🎵',
            'text/': '📝',
            'application/zip': '📦',
            'application/x-rar-compressed': '📦',
        };

        // Verificar correspondência exata
        if (iconMap[mimeType]) {
            return iconMap[mimeType];
        }

        // Verificar correspondência parcial (ex: image/png, image/jpeg)
        for (const [key, icon] of Object.entries(iconMap)) {
            if (mimeType.startsWith(key)) {
                return icon;
            }
        }

        // Ícone padrão
        return '📄';
    }

    /**
     * Busca ficheiros da pasta do Google Drive
     * 
     * Note: API keys in URLs are the standard method for Google API client-side applications.
     * When properly restricted by HTTP referrers in Google Cloud Console, this is secure.
     */
    async function fetchDriveFiles(folderId) {
        const fields = 'files(id,name,mimeType,webViewLink,iconLink,fileExtension)';
        const query = `'${folderId}' in parents and trashed=false`;
        const url = `${API_BASE_URL}/files?q=${encodeURIComponent(query)}&fields=${fields}&key=${DRIVE_CONFIG.apiKey}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.files || [];
        } catch (error) {
            console.error('Erro ao buscar ficheiros do Google Drive:', error);
            throw error;
        }
    }

    /**
     * Busca ficheiros recursivamente incluindo subpastas e constrói estrutura hierárquica
     * 
     * @param {string} folderId - ID da pasta do Google Drive
     * @param {string|null} parentId - ID da pasta pai (null para raiz)
     * @param {number} depth - Profundidade atual da recursão (padrão: 0)
     * @param {number} maxDepth - Profundidade máxima permitida (padrão: 2)
     *                            Limita a recursão para evitar chamadas excessivas à API
     * @returns {Promise<Array>} Array de objetos de ficheiros com estrutura hierárquica
     */
    async function fetchAllFiles(folderId, parentId = null, depth = 0, maxDepth = 2) {
        if (depth > maxDepth) {
            return [];
        }

        const files = await fetchDriveFiles(folderId);
        const allFiles = [];

        for (const file of files) {
            // Adicionar informação de hierarquia
            file.parentId = parentId;
            file.depth = depth;
            file.children = [];
            
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                // Adicionar a pasta
                allFiles.push(file);
                
                // Buscar ficheiros dentro da pasta (recursivamente)
                try {
                    const subFiles = await fetchAllFiles(file.id, file.id, depth + 1, maxDepth);
                    file.children = subFiles;
                    // Os subFiles são armazenados em file.children para manter a estrutura hierárquica
                    // e evitar duplicação quando renderizados recursivamente
                } catch (error) {
                    console.warn(`Erro ao buscar ficheiros da subpasta ${file.name}:`, error);
                }
            } else {
                allFiles.push(file);
            }
        }

        return allFiles;
    }

    /**
     * Ordena ficheiros: pastas primeiro, depois ficheiros, ambos alfabeticamente
     */
    function sortFiles(files) {
        return files.sort((a, b) => {
            const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
            const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';

            // Pastas primeiro
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;

            // Ordenação alfabética
            return a.name.localeCompare(b.name, 'pt');
        });
    }

    /**
     * Renderiza um ficheiro ou pasta individual
     */
    function renderFileItem(file, depth = 0) {
        const li = document.createElement('li');
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        
        li.className = isFolder ? 'file-item folder-item' : 'file-item';
        li.style.paddingLeft = `${depth * 30 + 15}px`;

        if (isFolder) {
            // Criar container para pasta com arrow e nome
            const folderHeader = document.createElement('div');
            folderHeader.className = 'folder-header';
            folderHeader.style.display = 'flex';
            folderHeader.style.alignItems = 'center';
            folderHeader.style.cursor = 'pointer';
            folderHeader.style.gap = '10px';

            // Arrow para expand/collapse
            const arrow = document.createElement('span');
            arrow.className = 'folder-arrow expanded';
            arrow.textContent = '▼';
            arrow.style.transition = 'transform 0.3s ease';
            arrow.style.display = 'inline-block';

            // Ícone e nome da pasta
            const iconSpan = document.createElement('span');
            iconSpan.className = 'file-icon';
            iconSpan.textContent = getFileIcon(file.mimeType, file.iconLink);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = file.name;
            nameSpan.style.fontWeight = '600';

            folderHeader.appendChild(arrow);
            folderHeader.appendChild(iconSpan);
            folderHeader.appendChild(nameSpan);
            li.appendChild(folderHeader);

            // Container para ficheiros nested
            if (file.children && file.children.length > 0) {
                const nestedContainer = document.createElement('ul');
                nestedContainer.className = 'nested-files expanded';
                nestedContainer.style.listStyle = 'none';
                nestedContainer.style.padding = '0';
                nestedContainer.style.margin = '0';
                nestedContainer.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
                nestedContainer.style.overflow = 'hidden';

                // Renderizar ficheiros filhos
                const sortedChildren = sortFiles(file.children);
                sortedChildren.forEach(childFile => {
                    const childElement = renderFileItem(childFile, depth + 1);
                    nestedContainer.appendChild(childElement);
                });

                li.appendChild(nestedContainer);

                // Adicionar evento de clique para toggle
                folderHeader.addEventListener('click', function(e) {
                    e.preventDefault();
                    const isExpanded = nestedContainer.classList.contains('expanded');
                    
                    if (isExpanded) {
                        nestedContainer.classList.remove('expanded');
                        nestedContainer.classList.add('collapsed');
                        arrow.classList.remove('expanded');
                        arrow.classList.add('collapsed');
                        arrow.textContent = '▶';
                    } else {
                        nestedContainer.classList.add('expanded');
                        nestedContainer.classList.remove('collapsed');
                        arrow.classList.add('expanded');
                        arrow.classList.remove('collapsed');
                        arrow.textContent = '▼';
                    }
                });
            }
        } else {
            // Ficheiro normal (não pasta)
            const link = document.createElement('a');
            link.href = file.webViewLink || `${DRIVE_FILE_BASE_URL}${file.id}/view`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'file-icon';
            iconSpan.textContent = getFileIcon(file.mimeType, file.iconLink);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = file.name;

            link.appendChild(iconSpan);
            link.appendChild(nameSpan);
            li.appendChild(link);
        }

        return li;
    }

    /**
     * Renderiza a lista de ficheiros no DOM com estrutura hierárquica
     */
    function renderFiles(files) {
        const filesList = document.querySelector('.files-list');
        
        if (!filesList) {
            console.error('Elemento .files-list não encontrado');
            return;
        }

        // Limpar lista existente
        filesList.innerHTML = '';

        if (files.length === 0) {
            showMessage('Nenhum ficheiro encontrado na pasta do Google Drive.', 'info');
            return;
        }

        // Ordenar ficheiros
        const sortedFiles = sortFiles(files);

        // Criar elementos da lista
        sortedFiles.forEach(file => {
            const fileElement = renderFileItem(file, 0);
            filesList.appendChild(fileElement);
        });
    }

    /**
     * Mostra mensagem de estado (loading, erro, etc.)
     */
    function showMessage(message, type = 'loading') {
        const filesList = document.querySelector('.files-list');
        
        if (!filesList) {
            return;
        }

        const existingMessage = filesList.querySelector('.drive-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('li');
        messageDiv.className = `file-item drive-message drive-message-${type}`;
        messageDiv.style.textAlign = 'center';
        messageDiv.style.fontStyle = 'italic';
        messageDiv.style.color = type === 'error' ? '#dc3545' : '#666';
        messageDiv.textContent = message;
        
        filesList.appendChild(messageDiv);
    }

    /**
     * Função principal de inicialização
     */
    async function initDriveIntegration() {
        try {
            showMessage('⏳ A carregar ficheiros do Google Drive...', 'loading');

            const files = await fetchAllFiles(DRIVE_CONFIG.folderId);
            renderFiles(files);

            console.log(`✓ ${files.length} ficheiros carregados do Google Drive`);
        } catch (error) {
            console.error('Erro ao carregar ficheiros:', error);
            
            let errorMessage = '❌ Erro ao carregar ficheiros do Google Drive.';
            
            if (error.message.includes('404')) {
                errorMessage += ' A pasta não foi encontrada ou não é pública.';
            } else if (error.message.includes('403')) {
                errorMessage += ' Permissão negada. Verifique se a chave API está correta e se a pasta é pública.';
            } else if (error.message.includes('400')) {
                errorMessage += ' Configuração inválida. Verifique o ID da pasta e a chave API.';
            } else {
                errorMessage += ' ' + error.message;
            }

            showMessage(errorMessage, 'error');
        }
    }

    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDriveIntegration);
    } else {
        initDriveIntegration();
    }
})();
