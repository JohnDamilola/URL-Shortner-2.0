import sys
sys.path.append('backend/src')
import unittest
import datetime
from flask import Flask
from flask import Blueprint, jsonify               #import dependancies
from flask import current_app as app
from flask_login import login_required, login_user, logout_user
from flask_cors import cross_origin
from flask import request
from models.user import User, db
from extensions import bcrypt
import jwt
from routes.auth import auth_bp

class AuthTestApp(unittest.TestCase):
    def setUp(self):
        self.app=Flask(__name__, instance_relative_config=False)
        self.app.register_blueprint(auth_bp)
        self.app=self.app.test_client()

    def test_register_route(self):
        '''Test the register route of our app'''
        response=self.app.post('/auth/register',json=dict(email='test_email@gmail.com',first_name='test_first',last_name='test_last',password='password123'))
        print(response.status_code)
        assert response.status_code==201
    """    
    def test_login_route(self):
        '''Test the login route of our app'''
        response=self.app.post('/login',json=dict(email='aaronadb@gmail.com',password='flashcards123'),follow_redirects=True)
        assert response.status_code==200
        
    def test_login_route_wrong_password(self):
        '''Test the login route of our app with a registered user with a wrong password'''
        response=self.app.post('/login',json=dict(email='aaronadb@gmail.com',password='flashcards'))
        assert response.status_code==400
        
    def test_login_route_unregistered_user(self):
        '''Test the login route of our app with an unregistered user'''
        response=self.app.post('/login',json=dict(email='aarondiasbarreto@gmail.com',password='flashcards123'))
        assert response.status_code==400
    """ 

if __name__=="__main__":
    unittest.main()