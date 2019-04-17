using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;
using System.ComponentModel;
using System.Windows.Controls;

namespace Gauge_Generator
{
    public class Layer
    {
        //PRIVATE VARIABLES
        string _label = "New Layer";

        //PROPERTIES
        [Description("Layer name"), Category("Basics")]
        public string Label
        {
            get { return _label; }
            set
            {
                _label = ValidateString(value, 20);
            }
        }

        [Description("Base layer name (read only)"), Category("Basics")]
        public string RangeSourceName {
            get
            {
                if (RangeSource == null) {
                    return "";
                }
                else
                {
                    return RangeSource.Label;
                }
            }
        }

        [Description("Base layer object (read only)"), Category("Basics"), Browsable(false)]
        public Range_Item RangeSource { get; private set; }

        //VIRTUAL METHODS
        virtual public void SetRangeSource(Range_Item obj)
        {
            RangeSource = obj;
        }

        virtual public void ValidateWithSource() { }

        virtual public void DrawLayer(ref Canvas can, int size) { }

        virtual public void DrawOverlay(ref Canvas can, int size, float alpha) { }

        //VALIDATION
        protected int ValidateInt(int val, int min, int max)
        {
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

        protected float ValidateFloat(float val, float min, float max)
        {
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

        protected string ValidateString(string val, int length, bool removeSpaces = false)
        {
            if (val.Length > length) val = val.Substring(0, length);
            if (removeSpaces) val.Replace(" ", "");
            return val;
        }

        protected Color ValidateColor(Color c, bool removeAlpha)
        {
            if (removeAlpha) c.A = 255;
            return c;
        }
    }
}
