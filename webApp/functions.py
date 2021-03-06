import os
from bin.src.classes.Config import Config as _Config


def get_custom_id():
    custom_file = 'custom/custom.ini'
    if os.path.isfile(custom_file):
        config = _Config(custom_file)
        for custom in config.cfg:
            if config.cfg[custom]['selected'] == 'True':
                path = config.cfg[custom]['path']
                if os.path.isdir(path):
                    return [custom, path]


def check_python_customized_files(path):
    array_of_import = {}
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(".py"):
                module = os.path.splitext(file)[0]
                path = os.path.join(root).replace('/', '.')
                array_of_import.update({
                    module: {
                        'module': module,
                        'path': path
                    }
                })
    return array_of_import


def retrieve_custom_positions(typology, config):
    if typology:
        file = config.cfg['REFERENCIAL']['referencialposition'] + str(typology) + '.ini'
        if os.path.isfile(file):
            positions = config.read_custom_position(file)
            return positions
    return False


def search_custom_positions(data, ocr, files, locale, file, config):
    regex = data['regex']
    target = data['target'].lower()
    position = data['position']
    target_file = ''
    if position:
        if 'page' not in data or ('page' in data and data['page'] in ['1', '', 'None', None]):
            if files.isTiff == 'True':
                if target == 'footer':
                    target_file = files.tiffName_footer
                elif target == 'header':
                    target_file = files.tiffName_header
                else:
                    target_file = files.tiffName
            else:
                if target == 'footer':
                    target_file = files.jpgName_footer
                elif target == 'header':
                    target_file = files.jpgName_header
                else:
                    target_file = files.jpgName
        elif data['page'] != '1':
            nb_pages = files.get_pages(file, config)
            if str(nb_pages) == str(data['page']):
                if files.isTiff == 'True':
                    if target == 'footer':
                        target_file = files.tiffName_last_footer
                    elif target == 'header':
                        target_file = files.tiffName_last_header
                    else:
                        target_file = files.tiffName_last
                else:
                    if target == 'footer':
                        target_file = files.jpgName_last_footer
                    elif target == 'header':
                        target_file = files.jpgName_last_header
                    else:
                        target_file = files.jpgName_last
            else:
                if files.isTiff == 'True':
                    if os.path.isfile(files.custom_fileName_tiff):
                        files.pdf_to_tiff(file, files.custom_fileName_tiff, False, False, True, target, data['page'])
                        target_file = files.custom_fileName_tiff
                    else:
                        return [False, (('', ''), ('', ''))]
                else:
                    if os.path.isfile(files.custom_fileName):
                        files.pdf_to_jpg(file + '[' + str(int(data['page']) - 1) + ']', False, True, target, False, True)
                        target_file = files.custom_fileName
                    else:
                        return [False, (('', ''), ('', ''))]
        if regex:
            locale_list = locale.get()
            regex = locale_list[regex]

        return search(position, regex, files, ocr, target_file)


def search_by_positions(supplier, index, config, locale, ocr, files, target_file, typo):
    if typo:
        typology = typo
    elif supplier and supplier[2]['typology']:
        typology = supplier[2]['typology']
    else:
        return False, (('', ''), ('', ''))

    positions = config.read_position(typology, index, locale)
    if positions:
        data = search(positions['position'], positions['regex'], files, ocr, target_file)
        if 'page' in positions and positions['page']:
            data.append(positions['page'])
        return data


def search(position, regex, files, ocr, target_file):
    position_array = ocr.prepare_ocr_on_fly(position)
    data = files.ocr_on_fly(target_file, position_array, ocr, None, regex)

    if not data:
        target_file_improved = files.improve_image_detection(target_file)
        data = files.ocr_on_fly(target_file_improved, position_array, ocr, None, regex)
        if data:
            return [data.replace('\n', ' '), position]
        else:
            data = files.ocr_on_fly(target_file_improved, position_array, ocr, None, regex, True)
            if data:
                return [data.replace('\n', ' '), position]
            return [False, (('', ''), ('', ''))]
    else:
        return [data.replace('\n', ' '), position]


def recursive_delete(list_folder, log):
    for folder in list_folder:
        if os.path.exists(folder):
            for file in os.listdir(folder):
                try:
                    os.remove(folder + '/' + file)
                except FileNotFoundError as e:
                    log.error('Unable to delete ' + folder + '/' + file + ' on temp folder: ' + str(e))
            try:
                os.rmdir(folder)
            except FileNotFoundError as e:
                log.error('Unable to delete ' + folder + ' on temp folder: ' + str(e))
