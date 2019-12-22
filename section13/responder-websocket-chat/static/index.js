$(function(){
  const ws = new WebSocket('ws://localhost:5042/ws');

  const id = Math.floor(Math.random()*1000)
  ws.onopen = function() {
    ws.send(`Hello id${id}!`);
  };

  ws.onmessage = function (e) {
    // メッセージのli要素作成
    $("<li>", {
      class: "list-group-item",
      text: e.data,
    }).appendTo('#chat');
  };

  // エンターキーが押された場合メッセージを送信
  $("#textbox").on("keypress", function (e) {
    if (e.keyCode == 13 && $(this).val()) {
      ws.send($(this).val());
      $(this).val("");
    }
  });


  ////////////
  // utils  //
  ////////////

  function mod(a, m) {
    // return 0 <= a mod m < m
    return a.mod(m).add(m).mod(m);
  }

  function coprime(a, MIN_SIZE=2, N_TRIAL=100) {
    for (let i = 0; i < N_TRIAL; ++i) {
      let n = bigInt.randBetween(1<<MIN_SIZE, a.subtract(1));
      if (bigInt.gcd(a, n).equals(1)) {
        //console.log(`get coprime in ${i} times.`);
        return n;
      }
    }
    throw("coprime is not found.");
  }

  function extended_gcd(a, b) {
    if (b == 0) {
      return [bigInt(1), bigInt(0)];
    }

    let [x, y] = extended_gcd(b, mod(a, b));

    return [y, x.subtract(a.divide(b).multiply(y))];
  }


  ////////////
  // primes //
  ////////////

  function miller_rabin_test(n, q, k, w) {
    let x = w.modPow(q, n);
    if (x.equals(1) || x.equals(n.subtract(1))) {
      return true;
    }

    //for (let i = 1; k.greater(i); ++i) {
    for (let i = 1; i < k; ++i) {
      x = mod(x.multiply(x), n);

      if (x.equals(n.subtract(1))) return true;
      if (x.equals(1)) return false;
    }

    return false;
  }

  function is_prime(n, N_TEST=10) {
    if (n.equals(2)) return true;
    if (n.equals(1) || n.isEven()) return false;

    let q = n.subtract(1);
    let k = bigInt(0);

    while (q.isEven()) {
      q = q.shiftRight(1);
      k = k.add(1);
    }

    console.assert(
      n.subtract(1).equals(
        bigInt(1).shiftLeft(k).multiply(q)));

    for (let i = 0; i < N_TEST; ++i) {
      w = bigInt.randBetween(1, n.subtract(1));
      if (!miller_rabin_test(n, q, k, w)) {
        return false;
      }
    }

    return true;
  }

  function prime_in(min, max, N_TRIAL=10000) {
    // return prime in [min, max)

    for (let i = 0; i < N_TRIAL; ++i) {
      //n = randint(min, max);
      let n = bigInt.randBetween(min, max.subtract(1));
      if (is_prime(n)) {
        //console.log(`get prime in ${i} times`);
        return n;
      }
    }

    throw("prime is not found.");
  }


  ////////////
  // RSA    //
  ////////////

  function generate_keys(SECURE_KEY_SIZE=1024) {
    let min = bigInt(1).shiftLeft(SECURE_KEY_SIZE/2);
    let max = min.multiply(2);

    let p = prime_in(min, max);
    let q = prime_in(min, max);

    let n = p.multiply(q);
    let L = bigInt(p.subtract(1)).multiply(q.subtract(1));
    let pub = coprime(L);
    let [prv, _] = extended_gcd(pub, L);
    prv = mod(prv, L);


    console.assert(mod(pub.multiply(prv), L).equals(1));

    return [n, pub, prv];
  }

  function encrypt(plain_text, n, pub) {
    return plain_text.modPow(pub, n);
  }

  function decrypt(encrypted_text, n, prv) {
    return encrypted_text.modPow(prv, n);
  }

  function msg_to_int(message, CHAR_SIZE=8) {
    let value = bigInt();
    for (let i = 0; i < message.length; ++i) {
      value = value.shiftLeft(CHAR_SIZE);
      value = value.add(message.charCodeAt(i));
    }
    return value;
  }

  function int_to_msg(value, CHAR_SIZE=8) {
    let message = "";
    for (let v of value.toArray(1<<CHAR_SIZE)["value"]) {
      message += String.fromCharCode(v);
    }
    return message;
  }

  $("#generate_keys").click(function() {
    var start_ms = new Date().getTime();

    let [n, pub, prv] = generate_keys(SECURE_KEY_SIZE=8*128);

    let msg = "fooo!";

    let E = encrypt(msg_to_int(msg), n, pub)
    console.log("encrypted message:", int_to_msg(E));

    let D = decrypt(E, n, prv)
    console.log("decrypted message:", int_to_msg(D));

    var elapsed_ms = new Date().getTime() - start_ms;
    console.log("elapsed time(ms):", elapsed_ms);
  });
});
