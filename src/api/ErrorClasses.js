//error if the username or Password is wrong
export class AuthenticationError{
    constructor(msg) {
        this.msg = msg;
    }
}
export class BlockedError{
    constructor(msg) {
        this.msg = msg;

    }

}