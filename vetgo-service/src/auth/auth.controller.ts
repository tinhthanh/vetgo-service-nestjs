import {Body, Controller, Post, Req} from '@nestjs/common';
import {AuthService} from "./auth.service";
import { AuthDTO } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("register")
    register(@Body() body: AuthDTO) {
        console.log(body);

        return "Register";
    }
    @Post("login")
    login() {
        return "Login";
    }
}
