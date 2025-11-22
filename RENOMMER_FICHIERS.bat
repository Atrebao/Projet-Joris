@echo off
echo Renommage des fichiers .tsx en .jsx et .ts en .js...
echo.

cd "c:\PROJETS_ANGE\COURS REACT\Projet-Joris\src"

REM Renommer les composants client
if exist "components\client\Navbar.tsx" (
    ren "components\client\Navbar.tsx" "Navbar.jsx"
    echo ✓ Navbar.tsx -> Navbar.jsx
)

if exist "components\client\OffreCard.tsx" (
    ren "components\client\OffreCard.tsx" "OffreCard.jsx"
    echo ✓ OffreCard.tsx -> OffreCard.jsx
)

REM Renommer les composants shared
if exist "components\shared\EmptyState.tsx" (
    ren "components\shared\EmptyState.tsx" "EmptyState.jsx"
    echo ✓ EmptyState.tsx -> EmptyState.jsx
)

if exist "components\shared\LoadingSpinner.tsx" (
    ren "components\shared\LoadingSpinner.tsx" "LoadingSpinner.jsx"
    echo ✓ LoadingSpinner.tsx -> LoadingSpinner.jsx
)

REM Renommer les pages client
if exist "pages\client\HomePage.tsx" (
    ren "pages\client\HomePage.tsx" "HomePage.jsx"
    echo ✓ HomePage.tsx -> HomePage.jsx
)

if exist "pages\client\CataloguePage.tsx" (
    ren "pages\client\CataloguePage.tsx" "CataloguePage.jsx"
    echo ✓ CataloguePage.tsx -> CataloguePage.jsx
)

REM Renommer les pages partenaire
if exist "pages\partenaire\DashboardPartenaire.tsx" (
    ren "pages\partenaire\DashboardPartenaire.tsx" "DashboardPartenaire.jsx"
    echo ✓ DashboardPartenaire.tsx -> DashboardPartenaire.jsx
)

REM Renommer les pages admin
if exist "pages\admin\DashboardAdmin.tsx" (
    ren "pages\admin\DashboardAdmin.tsx" "DashboardAdmin.jsx"
    echo ✓ DashboardAdmin.tsx -> DashboardAdmin.jsx
)

REM Renommer les fichiers lib (optionnel, .ts peut rester)
REM if exist "lib\utils.ts" (
REM     ren "lib\utils.ts" "utils.js"
REM     echo ✓ utils.ts -> utils.js
REM )

REM if exist "lib\api.ts" (
REM     ren "lib\api.ts" "api.js"
REM     echo ✓ api.ts -> api.js
REM )

echo.
echo ===================================
echo TERMINÉ ! Tous les fichiers ont été renommés
echo ===================================
echo.
echo NOTES:
echo - Les fichiers .ts dans lib/ n'ont PAS été renommés (TypeScript est OK pour lib/)
echo - Si vous voulez aussi les renommer, décommentez les lignes dans le script
echo.
pause
