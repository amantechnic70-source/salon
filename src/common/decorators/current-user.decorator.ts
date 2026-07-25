// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const CurrentUser = createParamDecorator(
//     (data: unknown, ctx: ExecutionContext) => {

//         const request = ctx.switchToHttp().getRequest();

//         return request.user;

//     },
// );

import {
    createParamDecorator,
    ExecutionContext,
} from "@nestjs/common";

export const CurrentUser =
    createParamDecorator(

        (_: unknown, ctx: ExecutionContext) => {

            const request =
                ctx
                    .switchToHttp()
                    .getRequest();

            return request.user;

        },

    );