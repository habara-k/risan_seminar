<!-- sectionTitle: 区間 -->
<!-- classes: section-title -->

# 区間

---

## 区間

```js
0-origin、半開区間が最も便利である

- [i, j) に含まれる要素数が（j - i）個
- [0, n) に含まれる要素数が n 個
```

---

## 区間の指定

```js
有開区間
- 区間[i, j) を位置i、jを表す２つのイテレータで指定する

算入区間
- 区間[i, j) を位置iを表すイテレータと、差分型の値（j - i）で指定する
```

---

## 有界区間の公理

```js
有界区間（コンセプト）の要求
- ２つのイテレータで指定される区間がvalidであること

公理
- コンテナの先頭と末尾による指定はvalid
- 相異なるイテレータによるvalid な指定であるとき、
  左端を１つ進めてもvalid のまま

これらの公理を満たすことを「規約」とする
- 実は先述のdistance 関数は、この規約に従う
```

---

## イテレータを進める

```js
// 入力イテレータ
// 線形時間がかかる
template<InputIterator I>
void advance(I& x, DifferenceType<I> n, std::input_iterator_tag) {
    while (n) {
        --n;
        ++x;
    }
}
```

---

## イテレータを進める

```js
// ランダムアクセスイテレータ
// 定数時間で計算可能
template<RandomAccessIterator I>
void advance(I& x, DifferenceType<I> n, std::random_access_iterator_tag) {
    x += n;
}

// ディスパッチ
template<InputIterator I>
void myadvance(I& x, DifferenceType<I> n) {
    advance(x, n, IteratorCategory<I>());
}
```
