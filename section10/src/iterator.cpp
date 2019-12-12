// #include <iostream>
// #include <vector>

#define InputIterator typename
#define RandomAccessIterator typename
#define ForwardIterator typename
#define Predicate typename

template<InputIterator I>
using DifferenceType = typename std::iterator_traits<I>::difference_type;

template<InputIterator I>
using IteratorCategory = typename std::iterator_traits<I>::iterator_category;

template<InputIterator I>
using ValueType = typename std::iterator_traits<I>::value_type;


// distance
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

template<RandomAccessIterator I>
DifferenceType<I> distance(I f, I l, std::random_access_iterator_tag) {
    // 事前条件: valid_range(f, l)
    return l - f;
}

template<InputIterator I>
DifferenceType<I> mydistance(I f, I l) {
    return distance(f, l, IteratorCategory<I>());
}


// advance
template<InputIterator I>
void advance(I& x, DifferenceType<I> n, std::input_iterator_tag) {
    while (n) {
        --n;
        ++x;
    }
}

template<RandomAccessIterator I>
void advance(I& x, DifferenceType<I> n, std::random_access_iterator_tag) {
    x += n;
}

template<InputIterator I>
void myadvance(I& x, DifferenceType<I> n) {
    advance(x, n, IteratorCategory<I>());
}


// // linear find
// template<InputIterator I, Predicate P>
// I find_if(I f, I l, P p) {
//     std::cout << "find_if(InputIterator) is called" << std::endl;
//     while (f != l && !p(*f)) {
//         ++f;
//     }
//     return f;
// }
//
// template<InputIterator I, Predicate P>
// std::pair<I, DifferenceType<I>> find_if_n(
//         I f, DifferenceType<I> n, P p) {
//     while (n && !p(*f)) { ++f; --n; }
//     return {f, n};
// }

// binary search
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

template<ForwardIterator I, Predicate P>
I mypartition_point(I f, I l, P p) {
    return partition_point_n(f, distance(f, l), p);
}

// lower_bound
template<ForwardIterator I>
I mylower_bound(I f, I l, ValueType<I> a) {
    return mypartition_point(f, l,
            [=](ValueType<I> x) { return x < a; });
}

// upper_bound
template<ForwardIterator I>
I myupper_bound(I f, I l, ValueType<I> a) {
    return mypartition_point(f, l,
            [=](ValueType<I> x) { return x <= a; });
}
