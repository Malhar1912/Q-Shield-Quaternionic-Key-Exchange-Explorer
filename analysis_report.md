# Quaternionic Key Exchange Analysis

## 1. Resilience Against Quantum Algorithms

### Abelian vs. Non-Abelian Structure
The core vulnerability of traditional public-key cryptosystems (RSA, ECC) to quantum attacks lies in their reliance on abelian (commutative) group structures.
*   **RSA**: Relies on the Integer Factorization Problem, which is reducible to finding the period of a function over a finite abelian group.
*   **ECC/DH**: Relies on the Discrete Logarithm Problem (DLP), which is an instance of the Abelian Hidden Subgroup Problem (HSP).

**Shor's Algorithm** efficiently solves the HSP for finite abelian groups in polynomial time. This is why RSA and ECC are broken by sufficiently large quantum computers.

**Quaternions**, however, form a **non-abelian** group (specifically, the multiplicative group of non-zero quaternions over a finite field $\mathbb{Z}_p$).
*   Multiplication is not commutative: $ij = k$ but $ji = -k$.
*   In general, $AB \neq BA$ for quaternions $A, B$.

### The Conjugacy Search Problem (CSP)
The scheme implemented in this project is based on the **Conjugacy Search Problem (CSP)**:
> Given a group $G$, an element $g \in G$, and $t = sgs^{-1}$ (where $s \in G$), find $s$.

In abelian groups, conjugation is trivial ($sgs^{-1} = ss^{-1}g = g$), so the problem degenerates. In non-abelian groups like quaternions, it is non-trivial.

**Quantum Resilience**:
*   The HSP for **non-abelian** groups is not generally solvable by Shor's algorithm.
*   While efficient quantum algorithms exist for *some* non-abelian groups (e.g., normal subgroups), the general non-abelian HSP remains an open problem and is considered quantum-hard.
*   Therefore, cryptographic schemes based on the hardness of CSP in quaternion groups are potential candidates for Post-Quantum Cryptography (PQC).

## 2. Evaluation of the Scheme

### Efficiency
*   **Computational Cost**: Quaternion arithmetic is highly efficient.
    *   Addition: 4 integer additions.
    *   Multiplication: 16 integer multiplications and 12 additions (or fewer with optimization).
    *   Inversion: 1 modular inverse (scalar) + 4 multiplications.
*   **Comparison**: This is comparable to or faster than elliptic curve point addition/doubling, and significantly faster than RSA exponentiation.
*   **Bandwidth**: A quaternion consists of 4 scalars. For a prime $p$, the key size is $4 \log_2 p$ bits. This is larger than ECC (2 coordinates) but much smaller than lattice-based keys (matrices).

### Entropy and Key Space
*   **Key Space Size**: For a prime modulus $p$, there are approximately $p^4$ quaternions.
*   **Effective Entropy**: The non-commutativity adds complexity, but the effective security depends on the difficulty of the CSP.
*   **Current Implementation**: The simulation uses small primes ($p=13, 251, 1009$).
    *   For $p=1009$, the key space is $\approx 10^{12}$, which is trivial to brute-force.
    *   For real security ($128$-bit), we would need $p^4 \approx 2^{128} \implies p \approx 2^{32}$. However, algebraic attacks (like length-based attacks) might require much larger parameters, potentially $p \approx 2^{256}$ or higher.

### Implementation Feasibility
*   **The "Naive" Protocol Failure**:
    The current codebase demonstrates a "naive" key exchange attempt:
    1.  Alice sends $T_A = A G A^{-1}$
    2.  Bob sends $T_B = B G B^{-1}$
    3.  Alice computes $K_A = A T_B A^{-1} = (AB) G (AB)^{-1}$
    4.  Bob computes $K_B = B T_A B^{-1} = (BA) G (BA)^{-1}$
    
    As the simulation correctly identifies, $K_A \neq K_B$ because $AB \neq BA$. This proves that a direct translation of Diffie-Hellman to quaternions is impossible.

*   **Feasible Protocols**:
    To make this feasible, one must use protocols designed for non-abelian groups, such as the **Anshel-Anshel-Goldfeld (AAG)** key exchange.
    *   AAG involves exchanging commutators or using specific subgroups.
    *   **Feasibility**: Implementing AAG is feasible but requires careful parameter selection to avoid length-based attacks, which have successfully broken instances of AAG over braid groups.

## 3. Conclusion
*   **Quantum Resistance**: High potential. The non-abelian structure of quaternions evades standard Shor's algorithm attacks.
*   **Efficiency**: Excellent. Operations are fast and parallelizable.
*   **Current Status**: The current codebase serves as an educational tool demonstrating *why* standard DH doesn't work, rather than a functional crypto system.
*   **Recommendation**: To build a working PQC scheme, the project should pivot to implementing the **Anshel-Anshel-Goldfeld** protocol or similar non-commutative key exchange mechanisms, rather than the naive conjugation exchange.
