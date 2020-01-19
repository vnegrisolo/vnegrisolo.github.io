 defmodule ErgZone.WorkoutMode do
-  def run([%{type: "dist", rest: 0}]) do
+  def run([
+        %{type: "dist", value: v1, rest: 0},
+        %{type: "dist", value: v2, rest: 0}
+      ])
+      when v1 >= v2 do
     "FixedDistSplits"
   end
 
-  def run([%{type: "dist", rest: _}]) do
+  def run([
+        %{type: "dist", value: v1, rest: r1},
+        %{type: "dist", value: v2, rest: r2}
+      ])
+      when v1 >= v2 and r1 >= r2 do
     "FixedDistInterval"
   end
 
-  def run([%{type: "time", rest: 0}]) do
+  def run([
+        %{type: "time", value: v1, rest: 0},
+        %{type: "time", value: v2, rest: 0}
+      ])
+      when v1 >= v2 do
     "FixedTimeSplits"
   end
 
-  def run([%{type: "time", rest: _}]) do
+  def run([
+        %{type: "time", value: v1, rest: r1},
+        %{type: "time", value: v2, rest: r1}
+      ])
+      when v1 >= v2 and r1 >= r2 do
     "FixedTimeInterval"
   end
 
   def run([
-        %{type: t, rest: r}
-        | [%{type: t, rest: r} | _] = tail
+        %{type: t, value: v, rest: r}
+        | [%{type: t, value: v, rest: r} | _] = tail
       ]) do
     run(tail)
   end
 
   def run(_intervals) do
     "VariableInterval"
   end
 end
