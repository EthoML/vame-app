from PyInstaller.utils.hooks import collect_data_files

# Include PyNWB's data files
datas = collect_data_files('pynwb')
