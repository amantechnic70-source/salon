// import { Injectable } from '@nestjs/common';

// import { PassportStrategy } from '@nestjs/passport';

// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(
//     Strategy,
// ) {
//     constructor() {
//         super({
//             jwtFromRequest:
//                 ExtractJwt.fromAuthHeaderAsBearerToken(),

//             ignoreExpiration: false,

//             secretOrKey:
//                 process.env.JWT_SECRET,
//         });
//     }

//     async validate(payload: any) {
//         return {

//             sub: payload.sub,

//             email: payload.email,

//             role: payload.role,

//             salonId:
//                 payload.salonId,

//         };
//     }
// }

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    "jwt",
) {

    constructor(

        private readonly configService: ConfigService,

    ) {

        super({

            jwtFromRequest:

                ExtractJwt.fromAuthHeaderAsBearerToken(),

            ignoreExpiration: false,

            secretOrKey:

                configService.get<string>(
                    "JWT_SECRET",
                ),

        });

    }

    async validate(payload: any) {

        return {

            sub: payload.sub,

            email: payload.email,

            role: payload.role,

            salonId: payload.salonId,

        };

    }

}