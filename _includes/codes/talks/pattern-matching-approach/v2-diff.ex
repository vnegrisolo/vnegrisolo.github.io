 defmodule ErgZone.WorkoutMode do
-  def run([%{type: "dist"}]) do
+  def run([%{type: "dist", rest: 0}]) do
     "FixedDistSplits"
   end
 
-  def run([%{type: "time"}]) do
+  def run([%{type: "dist", rest: _}]) do
+    "FixedDistInterval"
+  end
+
+  def run([%{type: "time", rest: 0}]) do
     "FixedTimeSplits"
   end
 
+  def run([%{type: "time", rest: _}]) do
+    "FixedTimeInterval"
+  end
+
   def run([
-        %{type: t}
-        | [%{type: t} | _] = tail
+        %{type: t, rest: r}
+        | [%{type: t, rest: r} | _] = tail
       ]) do
     run(tail)
   end
 
   def run(_intervals) do
     "VariableInterval"
   end
 end
