// #include <algorithm>

#include "iterator.cpp"

int main() {
    int n; std::cin >> n;
    std::vector<int> a(n), b(n), c(n);
    for (int i = 0; i < n; ++i) std::cin >> a[i];
    for (int i = 0; i < n; ++i) std::cin >> b[i];
    for (int i = 0; i < n; ++i) std::cin >> c[i];

    sort(a.begin(), a.end());
    sort(b.begin(), b.end());
    sort(c.begin(), c.end());

    long long ans = 0;
    for (int i = 0; i < n; ++i) {
        auto lb = mylower_bound(a.begin(), a.end(), b[i]);
        auto ub = myupper_bound(c.begin(), c.end(), b[i]);

        ans += (long long)mydistance(a.begin(), lb) * mydistance(ub, c.end());
    }

    std::cout << ans << std::endl;
}
