using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;

namespace Gauge_Generator
{
    public class Layer
    {
        //PRIVATE VARIABLES
        string _label;

        //PROPERTIES
        public string Label
        {
            get { return _label; }
            set
            {
                _label = ValidateString(value, 20);
            }
        }

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

        protected Layer RangeSource { get; set; }
        
        //VIRTUAL METHODS
        virtual public void DrawLayer(ref DrawingContext dc, int size) { }

        virtual public void DrawOverlay(ref DrawingContext dc, int size, float alpha) { }

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

        public Layer()
        {
            Label = "New Layer";
        }
    }
}
