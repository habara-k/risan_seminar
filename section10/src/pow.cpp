#include <iostream>
#include <vector>
#include <cassert>

int half(int n) {
    return n >> 1;
}
int odd(int n) {
    return n & 1;
}

std::vector<std::vector<int>> operator*(
        std::vector<std::vector<int>> A,
        std::vector<std::vector<int>> B) {
    assert(A[0].size() == B.size());
    int m = A.size(),
        n = B[0].size(),
        l = A[0].size();
    std::vector<std::vector<int>> ret(
            m, std::vector<int>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            for (int k = 0; k < l; ++k) {
                ret[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return ret;
}

template<typename T>
std::ostream& operator<<(
        std::ostream& os,
        std::vector<std::vector<T>> A) {
    for (int i = 0; i < A.size(); ++i) {
        os << (i ? " " : "[");
        for (int j = 0; j < A[i].size(); ++j) {
            os << (j ? " " : "[");
            os << A[i][j];
        }
        os << (i == A.size()-1 ? "]" : "]\n");
    }
    os << "]";
    return os;
}

struct monoid_tag {};
struct semigroup_tag {};

template<typename T, typename Z>
T pow(T a, Z n, monoid_tag) {
    T ret = T(1);
    while (n != Z(0)) {
        if (odd(n)) ret = ret * a;
        a = a * a;
        n = half(n);
    }
    return ret;
}

template<typename T, typename Z>
T pow(T a, Z n, semigroup_tag) {
    assert(n != Z(0));
    while (!odd(n)) {
        n = half(n);
        a = a * a;
    }

    T ret = a;
    while ((n = half(n)) != Z(0)) {
        a = a * a;
        if (odd(n)) ret = ret * a;
    }
    return ret;
}

int main() {
    std::cout << pow(2, 10, monoid_tag()) << std::endl;
    std::cout << pow(2, 0, monoid_tag()) << std::endl;
    std::vector<std::vector<int>> A{{1, 1}, {1, 0}};
    std::cout << A << std::endl;
    std::cout << pow(A, 10, semigroup_tag()) << std::endl;
    std::cout << pow(A, 0, semigroup_tag()) << std::endl;
    return 0;
}
