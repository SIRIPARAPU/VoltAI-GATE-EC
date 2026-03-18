import type { SubjectId } from "@/data/subjects";

export type Topic = {
  id: string;
  title: string;
};

export type Syllabus = Record<SubjectId, Topic[]>;

// Source-of-truth topic lists aligned to the standard GATE EC syllabus sections.
// Kept strict and topic-scoped to avoid mixing during notes/question generation.
export const SYLLABUS: Syllabus = {
  aptitude: [
    { id: "verbal-ability", title: "Verbal Ability" },
    { id: "numerical-ability", title: "Numerical Ability" },
    { id: "analytical-ability", title: "Analytical Reasoning" },
    { id: "spatial-ability", title: "Spatial Reasoning" },
    { id: "data-interpretation", title: "Data Interpretation" },
  ],

  maths: [
    { id: "linear-algebra", title: "Linear Algebra (Matrices, Determinants, Vector Spaces, Eigenvalues)" },
    { id: "calculus", title: "Calculus (Limits, Continuity, Differentiation, Integration, Maxima/Minima)" },
    { id: "differential-equations", title: "Differential Equations (First order, Higher order, Applications)" },
    { id: "complex-variables", title: "Complex Variables (Analytic functions, Cauchy-Riemann, Contours)" },
    { id: "probability", title: "Probability & Statistics (Random variables, Distributions, Mean/Variance)" },
    { id: "numerical-methods", title: "Numerical Methods (Root finding, Numerical integration/differentiation)" },
  ],

  "network-theory": [
    { id: "basic-laws", title: "Basic Circuit Laws (KCL, KVL) and Network Elements" },
    { id: "network-theorems", title: "Network Theorems (Thevenin/Norton, Superposition, Maximum Power Transfer)" },
    { id: "transient-analysis", title: "Transient Analysis (First/Second order circuits)" },
    { id: "sinusoidal-steady-state", title: "Sinusoidal Steady-State (Phasors, Power, Resonance)" },
    { id: "two-port", title: "Two-Port Networks (Z, Y, h, ABCD parameters)" },
    { id: "network-functions", title: "Network Functions, Poles/Zeros, Bode Plots (Basics)" },
  ],

  "signals-systems": [
    { id: "signals-lti", title: "Signals, Systems and LTI Properties (Convolution, Stability, Causality)" },
    { id: "fourier-series", title: "Fourier Series" },
    { id: "fourier-transform", title: "Fourier Transform and Properties" },
    { id: "laplace-transform", title: "Laplace Transform, ROC, System Analysis" },
    { id: "sampling", title: "Sampling Theorem and Reconstruction" },
    { id: "z-transform", title: "Z-Transform and Discrete-Time System Analysis" },
  ],

  edc: [
    { id: "semiconductor-physics", title: "Semiconductor Physics (Energy bands, Carrier concentration, Mobility)" },
    { id: "pn-diode", title: "PN Junction Diode (IV, Switching, Applications)" },
    { id: "bjt", title: "BJT (Operation, Characteristics, Small-signal models)" },
    { id: "mosfet", title: "MOSFET (Operation, Characteristics, Small-signal models)" },
    { id: "special-diodes", title: "Special Diodes (Zener, LED, Photodiode, Solar cell)" },
    { id: "power-devices", title: "Power Semiconductor Devices (Basics)" },
  ],

  analog: [
    { id: "diode-circuits", title: "Diode Circuits (Rectifiers, Clippers, Clampers)" },
    { id: "amplifiers", title: "Amplifiers (BJT/MOSFET biasing, small-signal, frequency response)" },
    { id: "feedback", title: "Feedback Amplifiers (Stability, Gain, Bandwidth)" },
    { id: "op-amp", title: "Operational Amplifiers (Ideal/Non-ideal, Applications)" },
    { id: "oscillators", title: "Oscillators (Barkhausen, RC/LC/Crystal basics)" },
    { id: "filters-regulators", title: "Analog Filters & Voltage Regulators (Basics)" },
  ],

  digital: [
    { id: "boolean-logic", title: "Boolean Algebra and Logic Gates" },
    { id: "combinational", title: "Combinational Circuits (K-map, MUX/DEMUX, Enc/Dec, Adders)" },
    { id: "sequential", title: "Sequential Circuits (FFs, Counters, Registers, Timing)" },
    { id: "fsm", title: "Finite State Machines (Design basics)" },
    { id: "memories-pld", title: "Memories and Programmable Logic Devices" },
    { id: "adc-dac", title: "ADC/DAC Basics and Data Converters" },
  ],

  "control-systems": [
    { id: "modeling", title: "Modeling and Transfer Functions (Block diagrams, Signal flow graphs)" },
    { id: "time-domain", title: "Time-Domain Analysis (Step response, steady-state error)" },
    { id: "stability", title: "Stability (Routh-Hurwitz, Root Locus)" },
    { id: "frequency-domain", title: "Frequency-Domain Analysis (Bode, Nyquist, Gain/Phase margins)" },
    { id: "state-space", title: "State-Space (State models, controllability/observability basics)" },
  ],

  communication: [
    { id: "analog-modulation", title: "Analog Modulation (AM/FM/PM) and Demodulation basics" },
    { id: "random-processes-noise", title: "Random Processes and Noise (Basics for comms)" },
    { id: "digital-modulation", title: "Digital Modulation (ASK/FSK/PSK/QAM) and Detection basics" },
    { id: "information-theory", title: "Information Theory (Entropy, Mutual Information, Channel capacity basics)" },
    { id: "coding", title: "Error Control Coding (Linear block codes, Convolutional coding basics)" },
    { id: "pcm-quantization", title: "PCM, Quantization and Sampling in Communication" },
  ],

  emft: [
    { id: "electrostatics", title: "Electrostatics (Fields, Potential, Gauss law, Capacitance, Dielectrics)" },
    { id: "magnetostatics", title: "Magnetostatics (Biot–Savart, Ampere law, Inductance, Magnetic materials)" },
    { id: "maxwell", title: "Maxwell’s Equations and EM Waves (Plane waves, Polarization)" },
    { id: "transmission-lines", title: "Transmission Lines (Parameters, Smith chart basics, Reflection)" },
    { id: "waveguides", title: "Waveguides and Antennas (Basics)" },
  ],
};

export function getTopics(subjectId: SubjectId) {
  return SYLLABUS[subjectId] ?? [];
}

