from PyInstaller.utils.hooks import collect_data_files

# Include HDMF's namespace JSON files
datas = collect_data_files('hdmf', subdir='common')
