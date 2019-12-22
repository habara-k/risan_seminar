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
    return ((a % m) + m) % m;
  }

  function randint(min, max) {
    // return random value in [min, max)
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function pow(a, n, m) {
    let ret = 1;
    while (n) {
      if (n & 1) ret = mod(ret * a, m);
      a = mod(a * a, m);
      n >>= 1;
    }
    return ret;
  }

  function gcd(a, b) {
    if (b == 0) {
      return a;
    }
    return gcd(b, mod(a, b));
  }

  function coprime(a, MIN_SIZE=3, N_TRIAL=100) {
    for (let i = 0; i < N_TRIAL; ++i) {
      let n = randint(1<<MIN_SIZE, a);
      if (gcd(a, n) == 1) {
        console.log(`get coprime in ${i} times.`);
        return n;
      }
    }
    throw("coprime is not found.");
  }

  function extended_gcd(a, b) {
    if (b == 0) {
      return [1, 0];
    }

    let [x, y] = extended_gcd(b, mod(a, b));

    return [y, x - Math.floor(a / b) * y];
  }


  ////////////
  // primes //
  ////////////

  function miller_rabin_test(n, q, k, w) {
    let x = pow(w, q, n);
    if (x == 1 || x == n-1) {
      return true;
    }

    for (let i = 1; i < k; ++i) {
      x = (x * x % n);

      if (x == n-1) return true;
      if (x == 1) return false;
    }

    return false;
  }

  function is_prime(n, N_TEST=100) {
    if (n == 2) {
      return true;
    }
    if (n == 1 || n & 1 == 0) {
      return false;
    }

    let q = n-1;
    let k = 0;
    while (q & 1 == 0) {
      q >>= 1;
      k += 1;
    }

    console.assert(n-1 === 2**k * q);

    for (let i = 0; i < N_TEST; ++i) {
      w = randint(1, n);
      if (!miller_rabin_test(n, q, k, w)) {
        return false;
      }
    }

    return true;
  }

  function prime_in(min, max, N_TRIAL=10000) {
    // return prime in [min, max)

    for (let i = 0; i < N_TRIAL; ++i) {
      n = randint(min, max);
      if (is_prime(n)) {
        console.log(`get prime in ${i} times`);
        return n;
      }
    }

    throw("prime is not found.");
  }


  ////////////
  // RSA    //
  ////////////

  function generate_keys(SECURE_KEY_SIZE=1000) {
    let min = 1<<(SECURE_KEY_SIZE/2);
    let max = 2 * min;

    let p = prime_in(min, max);
    let q = prime_in(min, max);

    let n = p * q;

    let L = (p-1) * (q-1);

    let pub = coprime(L);

    let [prv, _] = extended_gcd(pub, L);
    prv = mod(prv, L);

    console.assert(mod(pub * prv, L) == 1);

    return [n, pub, prv];
  }

  function encrypt(plain_text, n, pub) {
    return pow(plain_text, pub, n);
  }

  function decrypt(encrypted_text, n, prv) {
    return pow(encrypted_text, prv, n);
  }

  function msg_to_int(message, CHAR_SIZE=8) {
    let value = 0;
    for (let i = message.length-1; i >= 0; --i) {
      value <<= CHAR_SIZE;
      value += message.charCodeAt(i);
    }
    return value;
  }

  function int_to_msg(value, CHAR_SIZE=8) {
    let message = "";
    while (value) {
      message += String.fromCharCode(value % (1<<CHAR_SIZE));
      value >>= CHAR_SIZE;
    }
    return message;
  }

  $("#generate_keys").click(function() {
    console.log("mod(8, 5):", mod(8, 5));
    console.log("mod(-1, 5):", mod(-1, 5));
    console.log("randint(0, 2):", randint(0, 2));
    console.log("pow(4, 2, 7):", pow(4, 2, 7));
    console.log("coprime(10):", coprime(10));
    console.log("extended_gcd(7, 3):", extended_gcd(7, 3));
    console.log("is_prime(7):", is_prime(7));
    console.log("is_prime(10):", is_prime(10));
    console.log("prime_in(10, 20):", prime_in(10, 20));
    let [n, pub, prv] = generate_keys(SECURE_KEY_SIZE=20);
    console.log([n, pub, prv]);

    let msg = "hi";
    console.log(msg_to_int(msg));
    console.log(int_to_msg(msg_to_int(msg)));

    let E = encrypt(msg_to_int(msg), n, pub)
    console.log("E:", E);
    console.log("encrypted message:", int_to_msg(E));

    let D = decrypt(E, n, prv)
    console.log("D:", D);
    console.log("decrypted message:", int_to_msg(D));
  });
});
