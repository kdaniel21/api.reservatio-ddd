import Container from 'typedi'
import { loginResolver } from './useCases/login'
import LoginResolver from './useCases/login/LoginResolver'

import './subscribers/index'

Container.set(LoginResolver, loginResolver)
