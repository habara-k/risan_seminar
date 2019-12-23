import random


def miller_rabin_test(n, q, k, w):
    x = pow(w, q, n)
    if x == 1 or x == n-1:
        return True

    for _ in range(1, k):
        x = (x * x % n)

        if x == n-1:
            return True
        if x == 1:
            return False

    return False


def is_prime(n, N_TEST=10):
    # WORNING:
    #   return True incorrectly with probability (1/4)^N_TEST

    if n == 2:
        return True
    if n == 1 or n & 1 == 0:
        return False

    q, k = n-1, 0
    while q & 1 == 0:
        q >>= 1
        k += 1

    assert(n-1 == 2**k * q)

    for _ in range(N_TEST):
        w = random.randint(1, n-1)
        if not miller_rabin_test(n, q, k, w):
            return False

    return True


def prime_in(l, r, N_TRIAL=10000):
    # [l, r) に含まれる素数を返す

    for i in range(N_TRIAL):
        n = random.randint(l, r-1)
        if is_prime(n):
            print("get prime in {} times.".format(i))
            return n

    raise ValueError("prime is not found")


if __name__ == "__main__":
    l, r = list(map(int, input().split()))
    print(prime_in(l, r))
