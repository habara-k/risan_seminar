<!-- sectionTitle: 二分探索 -->
<!-- classes: section-title -->

# 二分探索

---

## 分割点の探索

```js
ソート済みのシーケンスに対して効率よく探索できる

- [f, m) の要素については true
- [m, l) の要素については false
となるようなm が存在するとき、m を見つける
```

---

## 分割点アルゴリズム

```js
// 算入区間[f, n) で区間を指定する
// 複数回走査するので,ForwardIteratorを要求

template<ForwardIterator I, Predicate P>
I partition_point_n(I f, DifferenceType<I> n, P p) {
    while (n) {
        I middle(f);
        DifferenceType<I> half(n >> 1);
        advance(middle, half);
        if (!p(*middle)) {
            n = half;
        } else {
            f = ++middle;
            n = n - (half + 1);
        }
    }
    return f;
}
```

---

## 分割点アルゴリズム

```js
// 有界区間[f, l) で区間を指定する
// 複数回走査するので,ForwardIteratorを要求

template<ForwardIterator I, Predicate P>
I partition_point(I f, I l, P p) {
    return partition_point_n(f, distance(f, l), p);
}
```

---

## 二分探索の補助定理の証明

<br />

- $$a \leq v_i$$ となる最小の $$i$$ を $$b_l$$
- $$a < v_i$$ となる最小の $$i$$ を $$b_u$$

とおくと, 区間$$[i, j)$$ がソート済みであることから
1, 2, 3 が全て従う.

---

### lower_bound, upper_bound

```js
template<InputIterator I>
using ValueType = typename std::iterator_traits<I>::value_type;

template<ForwardIterator I>
I lower_bound(I f, I l, ValueType<I> a) {
    return partition_point(f, l,
            [=](ValueType<I> x) { return x < a; });
}

template<ForwardIterator I>
I upper_bound(I f, I l, ValueType<I> a) {
    return partition_point(f, l,
            [=](ValueType<I> x) { return x <= a; });
}
```
