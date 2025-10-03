"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, context) => {
    const request = context.switchToHttp().getRequest();
    if (request.user === undefined) {
        throw new common_1.UnauthorizedException("当前请求缺少有效的身份信息");
    }
    return request.user;
});
