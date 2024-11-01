#MIT License
#
#Copyright (c) 2022 John Damilola, Leo Hsiang, Swarangi Gaurkar, Kritika Javali, Aaron Dias Barreto
#
#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in all
#copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#SOFTWARE.
import uuid
try:
	from ..extensions import db
except ImportError:
	from extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Link(db.Model):
    __tablename__ = 'links'
 
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stub = db.Column(db.String(100), unique=True, nullable=False)
    long_url = db.Column(db.String(2083), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    disabled = db.Column(db.Boolean, default=False, nullable=False)
    utm_source = db.Column(db.String(100), nullable=True)
    utm_medium = db.Column(db.String(100), nullable=True)
    utm_campaign = db.Column(db.String(100), nullable=True)
    utm_term = db.Column(db.String(100), nullable=True)
    utm_content = db.Column(db.String(100), nullable=True)
    password_hash = db.Column(db.String(), nullable=True)
    expire_on = db.Column(db.DateTime(timezone=True), nullable=True)
    created_on = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    updated_on = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False, server_onupdate=db.func.now())
    visit_count = db.Column(db.Integer, default=0)  # Current visit count
    max_visits = db.Column(db.Integer, default=999)  # Maximum number of visits before deactivation
   
    
	# make a relationship with 'User' model
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))

    def to_json(self):
        return {
        'id': self.id,
        'user_id':self.user_id,
        'stub':self.stub,
        'long_url' : self.long_url,
        'title':self.title,
        'disabled':self.disabled,
        'utm_source':self.utm_source,
        'utm_medium':self.utm_medium,
        'utm_campaign':self.utm_campaign,
        'utm_term':self.utm_term,
        'utm_content':self.utm_content,
        'expire_on':self.expire_on,
        'password_hash':self.password_hash,
        'created_on':self.created_on, 
        'updated_on':self.updated_on,   
        'visit_count':self.visit_count,
        'max_visits':self.max_visits
    }

    def __repr__(self):
        return '<id {}>'.format(self.id)

def load_link(id):
    return Link.query.get(id)
