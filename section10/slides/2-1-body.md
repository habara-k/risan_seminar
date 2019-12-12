<!-- sectionTitle: コンセプト -->
<!-- classes: section-title -->

# コンセプト

---

### 今までのジェネリックプログラミング

```js
template<typename T, typename Z>
T pow(T a, Z n) {
    T ret = T(1);
    while (n != Z(0)) {
        if (odd(n)) ret = ret * a;
        a = a * a;
        n = half(n);
    }
    return ret;
}

// template を使って一般化
// 一般化するために n の型もtemplate にした
```

---

## 問題点

```js
T はモノイドでなければならない
- a * a * a * a * a * a * a =
  ((a * (a * a)) * ((a * a) * (a * a)))
- 単位元 が必要

Z は自然数（以下0を含む）でなければならない
- pow(a, 7) = a * a * a * a * a * a * a
- odd(n), half(n) が必要
```

---

## コンセプト

```txt
型に関する一連の要件

- 演算
- 意味
- 時間・空間計算量
```

---

## T のコンセプト

```js
演算
- 二項演算*: T x T -> T
- コピーコンストラクタ
- 単位元のコンストラクタ: T(1)
- 代入

意味
- (T, *) がモノイドをなす
```

---

## Z のコンセプト

```js
演算
- （非）等価の判定: !=
- 奇数判定: odd(n)
- 2 で割る: half(n)
- ゼロのコンストラクタ: Z(0)
- 代入

意味
- 自然数を表すこと
```

---

### コンセプトを満たすことの確認

```txt
演算が存在しない場合はコンパイルエラーを吐くけど,
「モノイドをなすか」なんてどうやって確かめるの?

=> 「規約」によって保証するしかない
```

---

## インターフェイスとの違い

```txt
インターフェイス
- 引数と戻り値を厳格に規定したメソッドを要求

コンセプト
- 演算, 意味, 計算量に関する要求
```

---

### コンセプトを利用したコード


```js
// モノイドは n = 0 でも累乗が計算できる

struct monoid_tag {};

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
```

---

### コンセプトを利用したコード


```js
// 半群の場合, n != 0 を要求

struct semigroup_tag {};

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
```

---

### コンセプトを利用したコード

```js

int main() {
    std::cout << pow(2, 10, monoid_tag()) << std::endl;
    std::cout << pow(2, 0, monoid_tag()) << std::endl;
    std::vector<std::vector<int>> A{{1, 1}, {1, 0}};
    std::cout << pow(A, 10, semigroup_tag()) << std::endl;
    std::cout << pow(A, 0, semigroup_tag()) << std::endl;
    return 0;
}
// 1024
// 1
// [[89 55]
//  [55 34]]
// Assertion failed: (n != Z(0))
```

---

## Regular コンセプト

```js
a = b を要求しないのはなぜか？
- 「=」として「同じオブジェクトである」を認めるため？

RegularFunctionでない例は？
- アドレスを取得する関数

基本的には
- 等価が定義される
- 代入・コピーで等価性が保存される
ものと思えば大丈夫そう
```
