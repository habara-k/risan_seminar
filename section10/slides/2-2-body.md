<!-- sectionTitle: イテレータ -->
<!-- classes: section-title -->

# イテレータ

---

## イテレータ

```js
シーケンス内の場所を表すコンセプト

演算
- Regularの演算
- 後者演算（次の場所を返す）
- 逆参照（その場所の値を取得）

シーケンスの終わりを表す特別な値をサポートできる
- 後者演算が定義されない
- 逆参照が定義されない
```

---

## イテレータカテゴリー

```js
入力イテレータ
- 一方向・一度だけ
- （例）入力ストリーム

前方イテレータ
- 一方向・複数回可能
- （例）一方向の参照しか持たないリスト

双方向イテレータ
- 双方向・複数回可能
- （例）双方向の参照を持つリスト

ランダムアクセスイテレータ
- 任意の要素に定数時間でアクセス可能
- （例）配列
```

---

## イテレータ間の距離

```js
イテレータの差分型（距離の型）
- イテレータの型に依存する
- 関数: イテレータの型 -> 差分型 が必要

イテレータのカテゴリー（コンセプト）
- イテレータがランダムアクセス可能か？etc
- 関数: イテレータの型 -> カテゴリー が必要
```

---

## イテレータに関連する型関数

```js
// InputIterator はc++20 から導入予定の concept
// 現状はtypename としてdefine

template<InputIterator I>
using DifferenceType = typename std::iterator_traits<I>::difference_type;

template<InputIterator I>
using IteratorCategory = typename std::iterator_traits<I>::iterator_category;
```

---

## イテレータ間の距離

```js
// 入力イテレータ
// 線形時間がかかる
template<InputIterator I>
DifferenceType<I> distance(I f, I l, std::input_iterator_tag) {
    // 事前条件: valid_range(f, l)
    DifferenceType<I> n(0);
    while (f != l) {
        ++f;
        ++n;
    }
    return n;
}
```

---

## イテレータ間の距離

```js
// ランダムアクセスイテレータ
// 定数時間で計算可能
template<RandomAccessIterator I>
DifferenceType<I> distance(I f, I l, std::random_access_iterator_tag) {
    // 事前条件: valid_range(f, l)
    return l - f;
}

// ディスパッチ
template<InputIterator I>
DifferenceType<I> distance(I f, I l) {
    return distance(f, l, IteratorCategory<I>());
}
```
