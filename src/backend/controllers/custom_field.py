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

from ..models import custom_field


def add_custom_field(args):
    res, error = custom_field.add_custom_field(args)
    if res:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": "ERROR",
            "message": error
        }
        return response, 401


def retrieve_custom_fields(args):
    custom_fields, error = custom_field.retrieve_custom_fields(args)
    if custom_fields:
        response = {
            "customFields": custom_fields
        }
        return response, 200
    else:
        response = {
            "errors": "ERROR",
            "message": error
        }
        return response, 401


def update(args):
    res, error = custom_field.update(args)
    if res:
        response = {
            "res": res
        }
        return response, 200
    else:
        response = {
            "errors": "ERROR",
            "message": error
        }
        return response, 401
