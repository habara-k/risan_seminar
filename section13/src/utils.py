import random


def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)


def coprime(a, MIN_SIZE=64, N_TRIAL=100):
    for i in range(N_TRIAL):
        n = random.randint(1<<64, a-1)
        if gcd(a, n) == 1:
            print("get coprime in {} times.".format(i))
            return n

    raise ValueError("coprime is not found")


def extended_gcd(a, b):
    if b == 0:
        return 1, 0

    x, y = extended_gcd(b, a % b)

    return y, x - (a // b) * y
