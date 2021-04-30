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
def retrieve_batches(args):
    db = get_db()
    error = None
    batches = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'],
        'where': ['status <> %s'],
        'data': ['DEL']
    })
from ..controllers.db import get_db


def retrieve_batches(args):
    db = get_db()
    error = None
    batches = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'],
        'where': ['status <> %s'],
        'data': ['DEL']
    })

    if not batches:
        error = "ERROR : While getting batches"
    return batches, error


def get_batch_by_id(args):
    db = get_db()
    error = None
    batches = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'],
        'where': ['id = %s'],
        'data': [args['id']]
    })[0]

    if not batches:
        error = "ERROR : While getting batch"

    return batches, error


def get_batch_pages(args):
    db = get_db()
    error = None
    pages = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_pages'],
        'where': ['batch_id = %s'],
        'data': [args['id']]
    })

    if not pages:
        error = "ERROR : While getting pages"

    return pages, error


def change_status(args):
    db = get_db()
    args = {
        'table': ['splitter_batches'],
        'set': {
            'status': args['status']
        },
        'where': ['id = %s'],
        'data': [args['id']]
    }
    res = db.update(args)

    return res
