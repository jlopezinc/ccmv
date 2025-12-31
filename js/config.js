/**
 * Configuração do Google Drive API
 * 
 * Para obter estes valores, consulte o ficheiro GOOGLE_DRIVE_SETUP.md
 */

const DRIVE_CONFIG = {
    /**
     * ID da pasta do Google Drive
     * 
     * Para obter o ID da pasta:
     * 1. Abra a pasta no Google Drive
     * 2. Copie o ID do URL: https://drive.google.com/drive/folders/FOLDER_ID_AQUI
     * 3. Substitua 'YOUR_FOLDER_ID_HERE' pelo ID copiado
     */
    folderId: '1U-uOhcj_XDzTHoFWherETFJK7oSk__0k',
    
    /**
     * Chave API do Google Cloud
     * 
     * Para criar uma chave API:
     * 1. Aceda à Google Cloud Console (console.cloud.google.com)
     * 2. Crie um projeto (ou selecione um existente)
     * 3. Ative a Google Drive API
     * 4. Vá para "Credenciais" e crie uma "Chave API"
     * 5. Restrinja a chave apenas para a Google Drive API
     * 6. Substitua 'YOUR_API_KEY_HERE' pela chave criada
     * 
     * IMPORTANTE: Por motivos de segurança, também deve restringir a chave
     * por domínio (HTTP referrers) no Google Cloud Console.
     */
    apiKey: 'AIzaSyDuM197pj8aW1_m94OKgl2gw2b1_8u_SQU'
};
