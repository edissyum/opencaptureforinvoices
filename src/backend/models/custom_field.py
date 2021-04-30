# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from gettext import gettext

from ..controllers.db import get_db


def add_custom_field(args):
    db = get_db()
    error = None
    args = {
        'table': 'custom_fields',
        'columns': {
            'label_short': args['label_short'],
            'label': args['label'],
            'type': args['type'],
            'module': args['module'],
        }
    }
    res = db.insert(args)

    if not res:
        error = gettext('ERROR')

    return res, error


def retrieve_custom_fields(args):
    db = get_db()
    error = None
    custom_fields = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['custom_fields'],
    })

    if not custom_fields:
        error = gettext('ERROR')

    return custom_fields, error


def update(args):
    db = get_db()
    error = None

    res = db.update({
        'table': ['custom_fields'],
        'set': {
            'label': args['label'],
            'type': args['type'],
            'module': args['module'],
            'enabled': args['enabled'],
            'label_short': args['label_short'],
        },
        'where': ['id = %s'],
        'data': [args['id']]
    })

    if not res:
        error = gettext('ERROR')

    return res, error
