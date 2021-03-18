import Container from 'typedi'

import './subscribers/index'

import { loginResolver } from './useCases/login'
import LoginResolver from './useCases/login/LoginResolver'
Container.set(LoginResolver, loginResolver)

import RegisterResolver from './useCases/register/RegisterResolver'
import { registerResolver } from './useCases/register'
Container.set(RegisterResolver, registerResolver)
