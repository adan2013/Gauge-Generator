using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.ComponentModel;
using System.Windows.Controls;

namespace Gauge_Generator
{
    public class Layer
    {
        //PRIVATE VARIABLES
        public string _label = "New Layer";

        //PROPERTIES
        [Description("Layer name"), Category("Basics")]
        public string Label
        {
            get { return _label; }
            set
            {
                _label = ValidateString(value, 25);
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

        virtual public void LoadDefaultValues() { }

        virtual public void ValidateWithSource() { }
        
        virtual public void CloneCreator(Layer original, string name)
        {
            Label = name;
            RangeSource = original.RangeSource;
        }

        virtual public void DrawLayer(ref Canvas can, bool HQmode, int size) { }

        virtual public void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha) { }

        //VALIDATION
        protected double TranslateValue(double value)
        {
            return Math.Round(value * 100, 1);
        }

        protected int ValidateInt(int val, int min, int max)
        {
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

        protected double ValidateDouble(double val, double min, double max, bool translatevalue = true)
        {
            if (translatevalue) val = val / 100;
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

        protected System.Windows.Media.Color ValidateColor(System.Windows.Media.Color c, bool removeAlpha)
        {
            if (removeAlpha) c.A = 255;
            return c;
        }

        protected string ValidateFontFamily(string val)
        {
            try
            {
                FontFamily test = new FontFamily(val);
                if (test.Name == val) return val;
            } catch { }
            return Global.DEFAULT_FONT;
        }
    }
}
