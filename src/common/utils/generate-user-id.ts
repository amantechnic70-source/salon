export function generateUserId(
    role: string,
): string {

    const randomNumber = Math.floor(

        100000 + Math.random() * 900000,

    );

    switch (role) {

        case "CUSTOMER":
            return `CUS${randomNumber}`;

        case "SALON_OWNER":
            return `SAL${randomNumber}`;

        case "STAFF":
            return `STF${randomNumber}`;

        case "RECEPTIONIST":
            return `REC${randomNumber}`;

        case "SUPER_ADMIN":
            return `ADM${randomNumber}`;

        default:
            return `USR${randomNumber}`;

    }

}