from utils import coprime, extended_gcd
from miller_rabin import prime_in


def generate_key(*, SECURE_KEY_SIZE=1000):
    MIN = 1<<(SECURE_KEY_SIZE//2)
    MAX = MIN * 2

    p1, p2 = prime_in(MIN, MAX), prime_in(MIN, MAX)
    print("p1: {}".format(p1))
    print("p2: {}".format(p2))

    n = p1 * p2
    print("n: {}".format(n))

    L = (p1 - 1) * (p2 - 1)
    print("L: {}".format(L))

    pub = coprime(L)
    print("pub: {}".format(pub))

    prv, _ = extended_gcd(pub, L)
    prv %= L
    print("prv: {}".format(prv))

    assert((pub * prv) % L == 1)

    return n, pub, prv


def encrypt(*, plain_text, n, pub):
    return pow(plain_text, pub, n)


def decrypt(*, encrypted_text, n, prv):
    return pow(encrypted_text, prv, n)


def msg_to_int(message, CHAR_SIZE=8):
    value = 0
    for c in reversed(message):
        value <<= CHAR_SIZE
        value += ord(c)
    return value


def int_to_msg(value, CHAR_SIZE=8):
    message = ""
    while value:
        message += chr(value % (1<<CHAR_SIZE))
        value >>= CHAR_SIZE
    return message


if __name__ == "__main__":

    n, pub, prv = generate_key()

    E = encrypt(plain_text=msg_to_int(input()), n=n, pub=pub)
    print("E: {}".format(E))

    D = decrypt(encrypted_text=E, n=n, prv=prv)
    print("D: {}".format(D))
    print("decript message: {}".format(int_to_msg(D)))

