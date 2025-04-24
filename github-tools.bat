@echo off
echo ===================================================
echo Outils Git et GitHub pour la Ferme O'Neil
echo ===================================================
echo.

REM Vérification de Git
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Git n'est pas installé ou n'est pas dans le PATH.
    echo Veuillez installer Git depuis https://git-scm.com/downloads
    pause
    exit /b 1
)

:menu
cls
echo ===================================================
echo Outils Git et GitHub pour la Ferme O'Neil
echo ===================================================
echo.
echo Choisissez une action:
echo.
echo [1] Voir l'état des fichiers (git status)
echo [2] Mettre à jour le dépôt local (git pull)
echo [3] Ajouter et committer des modifications
echo [4] Pousser les modifications sur GitHub
echo [5] Gestion des branches
echo [6] Actions pour le Bot Discord
echo [7] Actions pour le Site Web
echo [8] Déployer avec GitHub Actions
echo [9] Aide - Voir toutes les commandes disponibles
echo [0] Quitter
echo.
set /p choix="Votre choix: "

if "%choix%"=="1" goto status
if "%choix%"=="2" goto pull
if "%choix%"=="3" goto commit
if "%choix%"=="4" goto push
if "%choix%"=="5" goto branches
if "%choix%"=="6" goto bot
if "%choix%"=="7" goto website
if "%choix%"=="8" goto actions
if "%choix%"=="9" goto help
if "%choix%"=="0" goto end

echo Choix invalide!
timeout /t 2 >nul
goto menu

:status
cls
echo ===================================================
echo État des fichiers
echo ===================================================
echo.
git status
echo.
pause
goto menu

:pull
cls
echo ===================================================
echo Mise à jour du dépôt local
echo ===================================================
echo.
echo Quelle branche souhaitez-vous mettre à jour?
echo.
echo [1] main
echo [2] master
echo [3] Autre branche
echo [0] Retour
echo.
set /p branch_pull="Votre choix: "

if "%branch_pull%"=="1" (
    git pull origin main
) else if "%branch_pull%"=="2" (
    git pull origin master
) else if "%branch_pull%"=="3" (
    set /p custom_branch="Nom de la branche: "
    git pull origin %custom_branch%
) else if "%branch_pull%"=="0" (
    goto menu
) else (
    echo Choix invalide!
    timeout /t 2 >nul
    goto pull
)
echo.
pause
goto menu

:commit
cls
echo ===================================================
echo Ajouter et committer des modifications
echo ===================================================
echo.
echo Que souhaitez-vous ajouter?
echo.
echo [1] Tout (git add .)
echo [2] Bot Discord Python
echo [3] Site Web
echo [4] Fichier(s) spécifique(s)
echo [0] Retour
echo.
set /p add_choice="Votre choix: "

if "%add_choice%"=="1" (
    git add .
    echo Tous les fichiers ont été ajoutés.
) else if "%add_choice%"=="2" (
    git add python-bot/
    echo Les fichiers du Bot Discord Python ont été ajoutés.
) else if "%add_choice%"=="3" (
    git add website/
    echo Les fichiers du site web ont été ajoutés.
) else if "%add_choice%"=="4" (
    set /p files="Entrez les fichiers à ajouter (ex: file1.js file2.css): "
    git add %files%
    echo Les fichiers spécifiés ont été ajoutés.
) else if "%add_choice%"=="0" (
    goto menu
) else (
    echo Choix invalide!
    timeout /t 2 >nul
    goto commit
)

echo.
set /p commit_msg="Message de commit: "
git commit -m "%commit_msg%"
echo.
echo Commit créé avec succès.
echo.
pause
goto menu

:push
cls
echo ===================================================
echo Pousser les modifications sur GitHub
echo ===================================================
echo.
echo Sur quelle branche souhaitez-vous pousser?
echo.
echo [1] main
echo [2] master
echo [3] Autre branche
echo [0] Retour
echo.
set /p branch_push="Votre choix: "

if "%branch_push%"=="1" (
    git push origin main
) else if "%branch_push%"=="2" (
    git push origin master
) else if "%branch_push%"=="3" (
    set /p custom_branch="Nom de la branche: "
    git push origin %custom_branch%
) else if "%branch_push%"=="0" (
    goto menu
) else (
    echo Choix invalide!
    timeout /t 2 >nul
    goto push
)
echo.
echo Push effectué avec succès.
echo.
pause
goto menu

:branches
cls
echo ===================================================
echo Gestion des branches
echo ===================================================
echo.
echo Que souhaitez-vous faire?
echo.
echo [1] Voir toutes les branches
echo [2] Créer une nouvelle branche
echo [3] Changer de branche
echo [4] Fusionner une branche
echo [5] Supprimer une branche
echo [0] Retour
echo.
set /p branch_choice="Votre choix: "

if "%branch_choice%"=="1" (
    echo Liste des branches:
    echo.
    git branch -a
) else if "%branch_choice%"=="2" (
    set /p new_branch="Nom de la nouvelle branche: "
    git checkout -b %new_branch%
    echo Branche %new_branch% créée.
) else if "%branch_choice%"=="3" (
    echo Liste des branches:
    git branch
    echo.
    set /p target_branch="Branche cible: "
    git checkout %target_branch%
    echo Passage à la branche %target_branch%.
) else if "%branch_choice%"=="4" (
    echo Branche actuelle:
    git branch --show-current
    echo.
    set /p merge_branch="Branche à fusionner: "
    git merge %merge_branch%
    echo Fusion de la branche %merge_branch%.
) else if "%branch_choice%"=="5" (
    echo Liste des branches:
    git branch
    echo.
    set /p del_branch="Branche à supprimer: "
    
    echo Vous êtes sur le point de supprimer la branche %del_branch%
    echo [1] Supprimer localement uniquement
    echo [2] Supprimer localement et sur GitHub
    echo [0] Annuler
    set /p del_type="Votre choix: "
    
    if "%del_type%"=="1" (
        git branch -d %del_branch%
        echo Branche %del_branch% supprimée localement.
    ) else if "%del_type%"=="2" (
        git branch -d %del_branch%
        git push origin --delete %del_branch%
        echo Branche %del_branch% supprimée localement et sur GitHub.
    ) else (
        echo Suppression annulée.
    )
) else if "%branch_choice%"=="0" (
    goto menu
) else (
    echo Choix invalide!
    timeout /t 2 >nul
    goto branches
)
echo.
pause
goto menu

:bot
cls
echo ===================================================
echo Actions pour le Bot Discord
echo ===================================================
echo.
echo Que souhaitez-vous faire?
echo.
echo [1] Mettre à jour le Bot Python
echo [2] Vérifier le statut du Bot
echo [3] Déployer le Bot via GitHub Actions
echo [0] Retour
echo.
set /p bot_choice="Votre choix: "

if "%bot_choice%"=="1" (
    echo Mise à jour du Bot Python...
    git add python-bot/
    set /p commit_msg="Message de commit (par défaut: 'Mise à jour du Bot Discord'): "
    if "%commit_msg%"=="" set commit_msg=Mise à jour du Bot Discord
    git commit -m "%commit_msg%"
    git push origin main
    echo Bot Python mis à jour avec succès.
) else if "%bot_choice%"=="2" (
    echo Instructions pour vérifier le statut du Bot:
    echo.
    echo 1. Accédez à votre dépôt GitHub
    echo 2. Cliquez sur l'onglet "Actions"
    echo 3. Vérifiez le statut des derniers workflows exécutés
) else if "%bot_choice%"=="3" (
    echo Instructions pour déployer le Bot via GitHub Actions:
    echo.
    echo 1. Accédez à votre dépôt GitHub
    echo 2. Cliquez sur l'onglet "Actions"
    echo 3. Sélectionnez le workflow "Run Discord Bot"
    echo 4. Cliquez sur "Run workflow"
    echo 5. Choisissez les options appropriées et lancez le workflow
) else if "%bot_choice%"=="0" (
    goto menu
) else (
    echo Choix invalide!
    timeout /t 2 >nul
    goto bot
)
echo.
pause
goto menu

:website
cls
echo ===================================================
echo Actions pour le Site Web
echo ===================================================
echo.
echo Que souhaitez-vous faire?
echo.
echo [1] Mettre à jour le Site Web
echo [2] Déployer le Site Web via GitHub Actions
echo [0] Retour
echo.
set /p web_choice="Votre choix: "

if "%web_choice%"=="1" (
    echo Mise à jour du Site Web...
    git add website/
    set /p commit_msg="Message de commit (par défaut: 'Mise à jour du Site Web'): "
    if "%commit_msg%"=="" set commit_msg=Mise à jour du Site Web
    git commit -m "%commit_msg%"
    git push origin main
    echo Site Web mis à jour avec succès.
) else if "%web_choice%"=="2" (
    echo Instructions pour déployer le Site Web via GitHub Actions:
    echo.
    echo 1. Accédez à votre dépôt GitHub
    echo 2. Cliquez sur l'onglet "Actions"
    echo 3. Sélectionnez le workflow "Deploy Website"
    echo 4. Cliquez sur "Run workflow"
    echo 5. Choisissez les options appropriées et lancez le workflow
) else if "%web_choice%"=="0" (
    goto menu
) else (
    echo Choix invalide!
    timeout /t 2 >nul
    goto website
)
echo.
pause
goto menu

:actions
cls
echo ===================================================
echo Déploiement via GitHub Actions
echo ===================================================
echo.
echo Instructions pour configurer et utiliser GitHub Actions:
echo.
echo 1. Configuration des secrets GitHub:
echo   - Accédez à votre dépôt GitHub
echo   - Cliquez sur "Settings" (Paramètres)
echo   - Dans le menu de gauche, cliquez sur "Secrets and variables" puis "Actions"
echo   - Cliquez sur "New repository secret"
echo   - Ajoutez les secrets nécessaires:
echo     * DISCORD_BOT_TOKEN: Token du bot Discord
echo     * SSH_HOST: Adresse du serveur SSH
echo     * SSH_USERNAME: Nom d'utilisateur SSH
echo     * SSH_PRIVATE_KEY: Clé privée SSH
echo.
echo 2. Exécution des workflows:
echo   - Accédez à votre dépôt GitHub
echo   - Cliquez sur l'onglet "Actions"
echo   - Sélectionnez le workflow souhaité
echo   - Cliquez sur "Run workflow"
echo   - Choisissez les options appropriées et lancez le workflow
echo.
echo 3. Surveillance des exécutions:
echo   - Accédez à votre dépôt GitHub
echo   - Cliquez sur l'onglet "Actions"
echo   - Sélectionnez un workflow récent
echo   - Cliquez sur un job pour voir les détails et les logs
echo.
pause
goto menu

:help
cls
echo ===================================================
echo Aide - Toutes les commandes Git disponibles
echo ===================================================
echo.
echo Veuillez consulter le fichier GITHUB-COMMANDS.md pour une documentation complète.
echo.
echo Voulez-vous ouvrir ce fichier maintenant?
echo.
echo [1] Oui
echo [2] Non
echo.
set /p open_doc="Votre choix: "

if "%open_doc%"=="1" (
    start "" "GITHUB-COMMANDS.md"
) else (
    echo Retour au menu principal...
)
echo.
pause
goto menu

:end
echo.
echo Au revoir!
echo.
exit /b 0