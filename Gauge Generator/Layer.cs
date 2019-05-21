using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.ComponentModel;
using System.Windows.Controls;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    [Serializable()]
    public class Layer
    {
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

        [Description("Visibility"), Category("Basics"), Browsable(false)]
        public bool Visible { get; set; }

        //VIRTUAL METHODS
        virtual public void SetRangeSource(Range_Item obj)
        {
            RangeSource = obj;
        }

        virtual public void LoadDefaultValues()
        {
            Visible = true;
        }

        virtual public void ValidateWithSource() { }
        
        virtual public void CloneCreator(Layer original, string name)
        {
            Label = name;
            RangeSource = original.RangeSource;
            Visible = original.Visible;
        }

        virtual public void DrawLayer(ref Canvas can, bool HQmode, int size) { }

        virtual public void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha) { }

        #region "VALIDATION"

        public static double TranslateValue(double value)
        {
            return Math.Round(value * 100, 1);
        }

        public static int ValidateInt(int val, int min, int max)
        {
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

        public static double ValidateDouble(double val, double min, double max, bool translatevalue = true)
        {
            if (translatevalue) val = val / 100;
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

        public static string ValidateString(string val, int length, bool removeSpaces = false)
        {
            if (val.Length > length) val = val.Substring(0, length);
            if (removeSpaces) val.Replace(" ", "");
            return val;
        }

        public static string MediaColorToString(MEDIA.Color c, bool removeAlpha)
        {
            return string.Format("#{0:X2}{1:X2}{2:X2}{3:X2}", removeAlpha ? 255 : c.A, c.R, c.G, c.B);
        }

        public static MEDIA.Color StringToMediaColor(string c)
        {
            return (MEDIA.Color)MEDIA.ColorConverter.ConvertFromString(c);
        }

        public static Color StringToDrawingColor(string c)
        {
            return ColorTranslator.FromHtml(c);
        }

        public static string ValidateFontFamily(string val)
        {
            try
            {
                FontFamily test = new FontFamily(val);
                if (test.Name == val) return val;
            }
            catch { }
            return Global.DEFAULT_FONT;
        }
        #endregion
    }
}
