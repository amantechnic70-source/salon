export function generateRoleId(): string {

    const randomNumber = Math.floor(

        100000 + Math.random() * 900000,

    );

    return `ROL${randomNumber}`;

}