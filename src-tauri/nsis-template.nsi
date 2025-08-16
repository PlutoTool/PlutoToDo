; Custom NSIS template for PlutoToDo to ensure Start Menu shortcuts
; This template ensures that Start Menu shortcuts are always created

!include MUI2.nsh
!include FileFunc.nsh
!include LogicLib.nsh

; Application information
!define APPNAME "Pluto ToDo"
!define COMPANYNAME "PlutoTool"
!define DESCRIPTION "A modern, elegant cross-platform todo application"

; Start Menu folder name
!define STARTMENU_FOLDER "Pluto ToDo"

; Define the installer and uninstaller names
OutFile "${OUTFILE}"
Name "${APPNAME}"
Icon "${ICON}"
InstallDir "$LOCALAPPDATA\${APPNAME}"

; Request application privileges
RequestExecutionLevel user

; Modern UI configuration
!define MUI_ABORTWARNING
!define MUI_ICON "${ICON}"
!define MUI_UNICON "${ICON}"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_STARTMENU Application $StartMenuFolder
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Version information
VIProductVersion "${VERSION}.0.0"
VIAddVersionKey "ProductName" "${APPNAME}"
VIAddVersionKey "CompanyName" "${COMPANYNAME}"
VIAddVersionKey "LegalCopyright" "© ${COMPANYNAME}"
VIAddVersionKey "FileDescription" "${DESCRIPTION}"
VIAddVersionKey "FileVersion" "${VERSION}"

Section "!${APPNAME}" SecInstall
    ; This section is required
    SectionIn RO
    
    ; Set output path to the installation directory
    SetOutPath $INSTDIR
    
    ; Install files (this will be populated by Tauri)
    ${INSTALL_FILES}
    
    ; Create Start Menu shortcuts
    !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
        CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
        CreateShortcut "$SMPROGRAMS\$StartMenuFolder\${APPNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe" "" "$INSTDIR\${MAINBINARYNAME}.exe" 0
        CreateShortcut "$SMPROGRAMS\$StartMenuFolder\Uninstall ${APPNAME}.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
    !insertmacro MUI_STARTMENU_WRITE_END
    
    ; Write registry keys for Add/Remove Programs
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayIcon" "$INSTDIR\${MAINBINARYNAME}.exe"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${VERSION}"
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninstaller.exe"
SectionEnd

Section "Desktop Shortcut" SecDesktop
    ; This section is optional and selected by default
    CreateShortcut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe" "" "$INSTDIR\${MAINBINARYNAME}.exe" 0
SectionEnd

; Section descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecInstall} "Core application files (required)"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} "Create a shortcut on the desktop for easy access"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Set desktop shortcut as selected by default
Function .onInit
    ; Select the desktop shortcut section by default
    !insertmacro SelectSection ${SecDesktop}
FunctionEnd

Section "Uninstall"
    ; Remove Start Menu shortcuts
    !insertmacro MUI_STARTMENU_GETFOLDER Application $StartMenuFolder
    Delete "$SMPROGRAMS\$StartMenuFolder\${APPNAME}.lnk"
    Delete "$SMPROGRAMS\$StartMenuFolder\Uninstall ${APPNAME}.lnk"
    RMDir "$SMPROGRAMS\$StartMenuFolder"
    
    ; Remove desktop shortcut if it exists
    Delete "$DESKTOP\${APPNAME}.lnk"
    
    ; Remove registry keys
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
    
    ; Remove files and directories
    ${UNINSTALL_FILES}
    RMDir $INSTDIR
SectionEnd
