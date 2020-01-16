<!-- sectionTitle: RSA暗号のしくみ -->
<!-- classes: section-title -->

# RSA暗号のしくみ

---

## 1. 計算するもの

- 2つのランダムな大きな素数$$p_1, p_2$$
- $$n = p_1p_2$$
- $$\phi(n) = \phi(p_1)\phi(p_2)$$
- $$\phi(n)$$ と互いに素であるランダムな数$$pub$$
- $$\phi(n)$$ を法とする$$pub$$ の逆元$$prv$$

---

## 2つの大きな素数$$p_1,p_2$$

- ランダムに値を生成して, 素数なら採用する
- 素数の判定は,ミラー・ラビンテストによって可能
- 1回のテストに$$O(\log p)$$
- k回テストすると,$$O(k\log p)$$で素数である確率$$\geq 1/4^k$$

---

## オイラー関数$$\phi(n)$$

- $$\phi(n) := 1$$以上$$n-1$$以下で,$$n$$ と互いに素な数の個数
- $$\phi(p) = p-1$$ ($$p$$: 素数)
- $$\phi(n) = \phi(p_1p_2) = \phi(p_1)\phi(p_2) = (p_1-1)(p_2-1)$$

---

## $$\phi(n)$$と互いに素な数$$pub$$

- ランダムに値$$pub$$を生成して,$$\mathrm{gcd}(n,pub) = 1$$なら採用する

---

## $$\phi(n)$$を法とする$$pub$$の逆元$$prv$$

- 拡張GCDを用いて, $$x \cdot pub + y \cdot \phi(n) = 1$$ なる$$x,y$$を計算
- $$prv = (x \ \mathrm{mod} \ \phi(n))$$ とおくと, $$prv \cdot pub \equiv 1 \ (\mathrm{mod} \ \phi(n))$$

---

## 2. 暗号化・復号

- 平文$$m$$ を,$$m^{pub} \ \mathrm{mod} \ n$$ で暗号化
- 暗号化したものを, $$(m^{pub})^{prv} \ \mathrm{mod} \ n$$ で復号
- 平文$$m$$ は$$m < n$$ である必要がある
- ASCII(1文字8bit)を128文字送るには,$$n \geq 2^{1024}$$が必要
- もっと長い文を送りたいときは,128文字ごとにブロック化など

---

## 復号できるのか？

$$
(m^{pub})^{prv}
= m^{pub \cdot prv}
= m^{1 + q \cdot \phi(n)}
= m(m^{\phi(n)})^q
$$

<br/>

### (a) $$m$$ と$$n$$ が互いに素のとき

$$m^{\phi(n)} \equiv 1 \ \mathrm{mod} \ n$$
より, $$(m^{pub})^{prv} \equiv m \cdot 1^q = m \ \mathrm{mod} \ n$$


---
## 復号できるのか？

$$
(m^{pub})^{prv}
= m(m^{\phi(n)})^q
= m((m^{p_2-1})^{p_1-1})^q
$$

<br/>

### (b) $$m$$ と$$n$$ が互いに素でないとき

$$m < n = p_1p_2$$ より,$$\gcd(m,n) = p_1$$として良い

- $$m$$は$$p_1$$の倍数より,$$(m^{pub})^{prv} \equiv m \equiv 0 \ \mathrm{mod} \ p_1$$

- $$m$$は$$p_2$$と互いに素だから,$$(m^{pub})^{prv} \equiv m(1^{p_1-1})^q \ \mathrm{mod} \ p_2 = m$$

よって$$(m^{pub})^{prv} \equiv m \ \mathrm{mod} \ n$$
