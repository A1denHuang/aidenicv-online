`timescale 1ns/1ps
`include "uvm_macros.svh"
import uvm_pkg::*;
class drain_test extends uvm_test;
  `uvm_component_utils(drain_test)
  bit bad;
  int ready_calls;
  time body_end;
  function new(string name = "drain_test", uvm_component parent = null);
    super.new(name, parent);
    bad = $test$plusargs("BAD");
  endfunction
  task run_phase(uvm_phase phase);
    // Questa's precompiled UVM-1.1d package uses a 1ps time unit.
    phase.phase_done.set_drain_time(this, 2us / 1ps);
    phase.raise_objection(this);
    #1us;
    body_end = $time;
    phase.drop_objection(this);
  endtask
  function void phase_ready_to_end(uvm_phase phase);
    if (phase.get_name() != "run") return;
    ready_calls++;
    // done is already true: the good form returns without another objection.
    if (!bad) return;
    phase.raise_objection(this);
    fork
      phase.drop_objection(this);
    join_none
  endfunction
  function void report_phase(uvm_phase phase);
    time tail;
    tail = $time - body_end;
    $display("DRAIN_RESULT bad=%0d calls=%0d body_end_ns=%0d tail_ns=%0d", bad, ready_calls, body_end, tail);
    if (!bad && tail != 2000) `uvm_fatal("TAIL", "good path must drain once")
    if (bad && (ready_calls != 20 || tail != 42000)) `uvm_fatal("TAIL", "bad path should repeat drain")
  endfunction
endclass
module drain_example;
  initial run_test("drain_test");
endmodule
